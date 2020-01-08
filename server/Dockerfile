FROM maven:3.5-jdk-8 AS build  
COPY src /usr/src/app/src  
COPY pom.xml /usr/src/app  
RUN mvn -f /usr/src/app/pom.xml clean package

FROM openjdk:8-jre-alpine  
COPY --from=build /usr/src/app/target/JazzHTTP-jar-with-dependencies.jar /usr/app/JazzHTTP-jar-with-dependencies.jar  
EXPOSE 4567  
ENTRYPOINT ["java","-jar","/usr/app/JazzHTTP-jar-with-dependencies.jar"]