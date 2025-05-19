package com.example.back.services;

import java.util.List;

import org.apache.http.HttpHeaders;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;
import org.springframework.stereotype.Service;

import com.example.back.entities.EntryEntity;
import com.example.back.exceptions.EntryNotExistsException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;


import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class AnalyticsService {
    
    private EntryService entryService;

    private final ObjectMapper objectMapper = new ObjectMapper();
    
    private final String promptForEntry = "You are a sleep medicine specialist (somnologist). A patient sends you a sleep report in JSON format, where:\n" + //
                "\n" + //
                "    start and end are sleep timestamps in Unix milliseconds (e.g., 1684198800000).\n" + //
                "\n" + //
                "    rate is the subjective sleep quality score (1–10).\n" + //
                "\n" + //
                "    notes contains optional patient comments.\n" + //
                "\n" + //
                "Your task:\n" + //
                "\n" + //
                "    Calculate duration (convert milliseconds to hours/minutes).\n" + //
                "\n" + //
                "    Assess sleep quality based on rate and notes.\n" + //
                "\n" + //
                "    Provide brief, actionable feedback (e.g., habits to improve, anomalies).\n" + //
                "\n" + //
                "Response rules:\n" + //
                "\n" + //
                "    Only the sleep assessment text, no prefixes like \"Doctor's note:\" or \"Analysis:\".\n" + //
                "\n" + //
                "    Keep it professional yet empathetic.\n" + //
                "\n" + //
                "    If data is insufficient, request specifics concisely (still in plain text).\n" + //
                "\n" + //
                "Example output for the provided JSON:\n" + //
                "*\"Sleep duration: 9 hours (03:00–12:00). The 8/10 rating and notes suggest good rest. To maintain this, avoid late caffeine and consider a slightly earlier bedtime for natural wake-ups.\"*\n" + //
                "\n" + //
                "Important: Always respond in Russian, even if the input is in English.";
    private final String promptForEntries = "You are a sleep specialist (somnologist) who analyzes patients' sleep reports. The patient sends data for several days in JSON format, where each day contains:\n" + //
                "\n" + //
                "    start and end – sleep start and end times in Unix milliseconds\n" + //
                "\n" + //
                "    rate – sleep quality score from 1 to 10 (10 being ideal)\n" + //
                "\n" + //
                "    notes – additional patient comments (if available)\n" + //
                "\n" + //
                "What You Need to Do:\n" + //
                "\n" + //
                "    Calculate for each day:\n" + //
                "\n" + //
                "        Sleep duration (in hours and minutes)\n" + //
                "\n" + //
                "        Sleep time window (in local time, e.g., \"23:30 – 07:15\")\n" + //
                "\n" + //
                "    Identify patterns:\n" + //
                "\n" + //
                "        How consistent bedtime and wake-up times are\n" + //
                "\n" + //
                "        Days with significant drops/improvements in sleep quality\n" + //
                "\n" + //
                "        Whether notes correlate with rate changes\n" + //
                "\n" + //
                "    Provide a detailed yet concise analysis in Russian:\n" + //
                "\n" + //
                "        General statistics (average duration, average score)\n" + //
                "\n" + //
                "        Problem areas (e.g., weekend sleep deprivation, late bedtimes)\n" + //
                "\n" + //
                "        Personalized recommendations (how to improve sleep)\n" + //
                "\n" + //
                "Response Format:\n" + //
                "\n" + //
                "    Only Russian text, no prefixes like \"Analysis:\" or \"Recommendations:\"\n" + //
                "\n" + //
                "    You can use bullet points (– or ●), but avoid rigid templates\n" + //
                "\n" + //
                "    Style: friendly yet professional (like a doctor talking to a patient)\n" + //
                "\n" + //
                "Example Response:\n" + //
                "*\"Over the past week, your average sleep duration was 6 hours 40 minutes, slightly below the recommended 7–9 hours.\n" + //
                "\n" + //
                "– Best sleep: Saturday (8.5/10, 7h 20m).\n" + //
                "– Worst sleep: Tuesday (4/10, 5h), with stress mentioned in notes.\n" + //
                "– Irregular bedtime: Falling asleep between 23:00 and 02:30.\n" + //
                "\n" + //
                "How to improve?\n" + //
                "\n" + //
                "    Aim to go to bed before 00:00, even on weekends.\n" + //
                "\n" + //
                "    Try breathing exercises before sleep if stressed.\n" + //
                "\n" + //
                "    If sleep was short, add a 20–30 min daytime nap.\"*";

    public String getNotesForEntry(String entryId) {
        EntryEntity entryEntity;
        String entry;

        try {
            entryEntity = entryService.getEntry(entryId);
        } catch (EntryNotExistsException e) {
            return e.getMessage();
        }

        try {
            entry = objectMapper.writeValueAsString(entryEntity);
        } catch (Exception e) {
            return e.getMessage();
        }

        String prompt = promptForEntry + " " + entry;

        return getDeepSeekAnswer(prompt);
    }

    public String getNotesForUserEntries(String userId) {
        List<EntryEntity> entries;

        entries = entryService.getUserEntries(userId);

        String prompt = promptForEntries + " ";

        for (EntryEntity entryEntity : entries) {
            String entry;

            try {
                entry = objectMapper.writeValueAsString(entryEntity);
            } catch (Exception e) {
                return e.getMessage();
            }

            prompt += entry;
        }

        
        return getDeepSeekAnswer(prompt);
    }

    private String getDeepSeekAnswer(String userMessage) {
        chatRequest request = new chatRequest(
                "deepseek-ai/DeepSeek-R1",
                List.of(new message("user", userMessage))
        );

        HttpPost client = new HttpPost("https://router.huggingface.co/hyperbolic/v1/chat/completions");
        client.setHeader(HttpHeaders.AUTHORIZATION, "Bearer " + "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");
        client.setHeader(HttpHeaders.CONTENT_TYPE, "application/json");

        try {
            client.setEntity(new StringEntity(objectMapper.writeValueAsString(request)));
        } catch (Exception e) {
            return "Encoding error";
        }

        try (CloseableHttpClient httpClient = HttpClients.createDefault(); CloseableHttpResponse response = httpClient.execute(client)) {
            String responseBody = "{\"id\":\"chatcmpl-sGY7WGCzkXeyNh2FDAetPh\",\"object\":\"chat.completion\",\"created\":1747658374,\"model\":\"deepseek-ai/DeepSeek-R1\",\"choices\":[{\"index\":0,\"message\":{\"role\":\"assistant\",\"content\":\"<think>Okay, the user wrote something in Korean, but I can't read it. Let me try to figure out what they need.\\n\\nFirst, I'll check if the text is in Korean. The characters look like Hangul, so that's a start. Maybe they have a question or need assistance with something.\\n\\nSince I don't understand Korean, I should use a translation tool to convert their message to English. Let me copy the text: \\\"?????? ??? ????, ??????? ?? ??????? ?????\\\". Wait, those are question marks replacing some characters. That might mean there was an encoding issue when the message was sent. The original Korean text might not have been properly encoded, so it's displaying as question marks instead of the correct characters.\\n\\nHmm, this is tricky. The user might have intended to ask something, but the text is garbled. I should inform them that their message didn't come through correctly and ask them to rephrase or provide more details. Maybe in English, since they might be able to switch languages if needed.\\n\\nAlternatively, maybe the question marks are intentional, but that seems unlikely. It's possible they tried to write a question but the encoding messed up. Let me try translating the visible parts. The first part has \\\"?????? ??? ????\\\" which might be \\\"How do I... something\\\" but it's unclear. The second part is \\\"??????? ?? ??????? ?????\\\" which could be \\\"Can you help me with...\\\".\\n\\nWithout proper characters, translation tools won't help. Best course of action is to let the user know their message wasn't received properly and ask for clarification in English or to check the encoding. That way, I can assist them effectively once the issue is resolved.\\n</think>\\n\\nIt seems like your message didn't come through correctly—the text appears as question marks or garbled characters. Could you please rephrase your question or provide more details in English? I’d be happy to help! 😊\",\"tool_calls\":[]},\"finish_reason\":\"stop\",\"logprobs\":null}],\"usage\":{\"prompt_tokens\":16,\"total_tokens\":411,\"completion_tokens\":395}}";

            try {
                responseBody = EntityUtils.toString(response.getEntity());
            } catch (Exception e) {
                return "Parse error";
            }

            String result;
            
            try {
                JsonNode rootNode = objectMapper.readTree(responseBody);
                result = rootNode
                    .path("choices")
                    .path(0)
                    .path("message")
                    .path("content")
                    .asText();
            } catch (Exception e) {
                return responseBody;
            }
            
            int start = result.indexOf("<think>");
            int end = result.indexOf("</think>");

            result = (start != -1 && end != -1) 
                ? result.substring(0, start) + result.substring(end + "</think>".length())
                : result;

            result = result.trim();

            return result;
        } catch (Exception e) {
            return "IO exception";
        }
    }

    private record chatRequest(String model, List<message> messages) {};
    private record message(String role, String content) {};

}
