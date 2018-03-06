package com.auth0;

import com.auth0.json.JsonAddress;
import com.auth0.json.JsonPeople;
import com.auth0.json.JsonPerson;
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
    private static JsonPeople jsonPeople;

    @Bean
    ProtobufHttpMessageConverter protobufHttpMessageConverter() {
        return new ProtobufHttpMessageConverter();
    }

    public static void main(String[] args) throws InvalidProtocolBufferException {
        final List<Person> peopleList = new ArrayList<>();
        final List<JsonPerson> jsonPersonList = new ArrayList<>();
        for (int i = 0; i < 50000; i++) {
            peopleList.add(generatePerson(i));
            jsonPersonList.add(generateJsonPerson(i));
        }

        people = People.newBuilder()
                .addAllPerson(peopleList)
                .build();

        JsonPeople jsonPeople = new JsonPeople();
        jsonPeople.setPerson(jsonPersonList);
        SpeedTestApp.jsonPeople = jsonPeople;

        SpringApplication.run(SpeedTestApp.class, args);
    }

    private static Person generatePerson(int i) {
        final Address address1 = Address.newBuilder()
                .setStreet("Street Number " + i)
                .setNumber(i)
                .build();

        final Address address2 = Address.newBuilder()
                .setStreet("Street Number " + i)
                .setNumber(i)
                .build();

        return Person.newBuilder()
                .setName("Person Number " + i)
                .addMobile("111111" + i)
                .addMobile("222222" + i)
                .addEmail("emailperson" + i + "@somewhere.com")
                .addEmail("otheremailperson" + i + "@somewhere.com")
                .addAddress(address1)
                .addAddress(address2)
                .build();
    }

    private static JsonPerson generateJsonPerson(int i) {
        JsonPerson jsonPerson = new JsonPerson();

        List<JsonAddress> jsonAddresses = new ArrayList<>();

        JsonAddress jsonAddress1 = new JsonAddress();
        jsonAddress1.setNumber(i);
        jsonAddress1.setStreet("Street Number " + i);
        jsonAddresses.add(jsonAddress1);

        JsonAddress jsonAddress2 = new JsonAddress();
        jsonAddress2.setNumber(i);
        jsonAddress2.setStreet("Street Number " + i);
        jsonAddresses.add(jsonAddress2);

        jsonPerson.setAddress(jsonAddresses);

        List<String> emails = new ArrayList<>();
        emails.add("emailperson" + i + "@somewhere.com");
        emails.add("otheremailperson" + i + "@somewhere.com");

        jsonPerson.setEmail(emails);

        jsonPerson.setName("Person Number " + i);

        List<String> mobiles = new ArrayList<>();
        mobiles.add("111111" + i);
        mobiles.add("222222" + i);

        jsonPerson.setMobile(mobiles);
        return jsonPerson;
    }

    public static People getPeople() {
        return people;
    }

    public static JsonPeople getJsonPeople() {
        return jsonPeople;
    }
}