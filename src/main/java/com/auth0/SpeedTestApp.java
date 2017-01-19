package com.auth0;

import com.auth0.protobuf.Entities;
import com.google.protobuf.InvalidProtocolBufferException;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.converter.protobuf.ProtobufHttpMessageConverter;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@SpringBootApplication
public class SpeedTestApp {
    private static List<Entities.Person> people = new ArrayList<>();

    @Configuration
    public static class RestClientConfiguration {

        @Bean
        RestTemplate restTemplate(ProtobufHttpMessageConverter hmc) {
            return new RestTemplate(Arrays.asList(hmc));
        }

        @Bean
        ProtobufHttpMessageConverter protobufHttpMessageConverter() {
            return new ProtobufHttpMessageConverter();
        }
    }

    public static void main(String[] args) throws InvalidProtocolBufferException {
        for (int i = 0; i < 5000; i++) {
            Entities.Address.Builder addressBuilder = Entities.Address.newBuilder();
            addressBuilder.setStreet("Street Number " + i);
            addressBuilder.setNumber(i);

            Entities.Person.Builder personBuilder = Entities.Person.newBuilder();
            personBuilder.setName("Person Number " + i);
            personBuilder.setAge(32);
            personBuilder.setHeight(182);
            personBuilder.setWeight(82);
            personBuilder.setAddress(addressBuilder);

            people.add(personBuilder.build());
        }

        SpringApplication.run(SpeedTestApp.class, args);
    }

    public static List<Entities.Person> getPeople() {
        return people;
    }
}
