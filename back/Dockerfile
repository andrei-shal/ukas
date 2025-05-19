# Используем официальный образ с Maven и JDK 17
FROM maven:3.8.6-eclipse-temurin-17 AS build

WORKDIR /app
COPY pom.xml .
# Сначала скачиваем зависимости (кешируем этот слой)
RUN mvn dependency:go-offline -B

COPY src ./src
# Собираем JAR (пропускаем тесты)
RUN mvn clean package -DskipTests

# Финальный образ
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]