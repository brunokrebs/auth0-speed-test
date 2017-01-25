package com.auth0;

import com.auth0.protobuf.PeopleOuterClass.Address;
import com.auth0.protobuf.PeopleOuterClass.People;
import com.auth0.protobuf.PeopleOuterClass.Person;
import com.google.protobuf.InvalidProtocolBufferException;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.http.converter.protobuf.ProtobufHttpMessageConverter;

import java.util.ArrayList;
import java.util.List;

@SpringBootApplication
public class SpeedTestApp {
    private static People people;

    @Bean
    ProtobufHttpMessageConverter protobufHttpMessageConverter() {
        return new ProtobufHttpMessageConverter();
    }

    public static void main(String[] args) throws InvalidProtocolBufferException {
        final List<Person> peopleList = new ArrayList<>();
        for (int i = 0; i < 50000; i++) {
            final Address address1 = Address.newBuilder()
                    .setStreet("Street Number " + i)
                    .setNumber(i)
                    .build();

            final Address address2 = Address.newBuilder()
                    .setStreet("Street Number " + i)
                    .setNumber(i)
                    .build();

            final Person person = Person.newBuilder()
                    .setName("Person Number " + i)
                    .addMobile("111111" + i)
                    .addMobile("222222" + i)
                    .addEmail("emailperson" + i + "@somewhere.com")
                    .addEmail("otheremailperson" + i + "@somewhere.com")
                    .addAddress(address1)
                    .addAddress(address2)
                    .build();

            peopleList.add(person);
        }

        people = People.newBuilder()
                .addAllPerson(peopleList)
                .build();

        SpringApplication.run(SpeedTestApp.class, args);
    }

    public static People getPeople() {
        return people;
    }
}