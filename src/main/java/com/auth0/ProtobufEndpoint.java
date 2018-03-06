package com.auth0;

import com.auth0.json.JsonPeople;
import com.auth0.protobuf.PeopleOuterClass.People;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mashape.unirest.http.Unirest;
import com.mashape.unirest.http.exceptions.UnirestException;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.net.URL;
import java.util.Date;

@RestController
public class ProtobufEndpoint {
    private static final int NUMBER_OF_RUNS = 500;

    @RequestMapping(path = "/protobuf/people", method = RequestMethod.GET, produces = "application/x-protobuf")
    public People getPeopleProtobuf() {
        return SpeedTestApp.getPeople();
    }

    @RequestMapping(path = "/protobuf/people", method = RequestMethod.POST, consumes = "application/x-protobuf")
    public void postPeopleProtobuf(@RequestBody People people) {
        System.out.println(people.getPersonList().get(0).getName());
    }

    @RequestMapping(path = "/json/people", method = RequestMethod.POST, consumes = "application/json")
    public void postPeopleJson(@RequestBody JsonPeople people) {
        System.out.println(people.getPerson().get(0).getName());
    }

    @RequestMapping(path = "/json/people", method = RequestMethod.GET, produces = "application/json")
    public JsonPeople getPeopleJSON() {
        return SpeedTestApp.getJsonPeople();
    }

    @RequestMapping(path = "/protobuf/java", method = RequestMethod.GET)
    public Response getProtobufJava() throws UnirestException, IOException {
        getProtobuf(); // heating the engines
        getJson(); // heating the engines

        long protobufTimes = 0;
        long jsonTimes = 0;

        for (int i = 0; i < NUMBER_OF_RUNS; i++) {
            protobufTimes += getProtobuf();
            jsonTimes += getJson();
        }
        long totalProtobuf = protobufTimes / NUMBER_OF_RUNS;
        long totalJson = jsonTimes / NUMBER_OF_RUNS;
        System.out.println("It took an avarage of " + totalProtobuf + "ms to load with protobuf.");
        System.out.println("It took an avarage of " + totalJson + "ms to load with json.");

        return new Response(totalProtobuf, totalJson);
    }

    private long getProtobuf() throws UnirestException, IOException {
        long start = (new Date()).getTime();
        People people = People.parseFrom(Unirest.get("http://127.0.0.1:8081/protobuf/people").asBinary().getRawBody());
        long time = (new Date()).getTime() - start;
        System.out.println("protobuf took " + time + "ms to load " + people.getPersonList().size() + " people.");
        return time;
    }

    private long getJson() throws IOException {
        long start = (new Date()).getTime();
        ObjectMapper mapper = new ObjectMapper();
        JsonPeople people = mapper.readValue(new URL("http://127.0.0.1:8081/json/people"), JsonPeople.class);
        long time = (new Date()).getTime() - start;
        System.out.println("json took " + time + "ms to load " + people.getPerson().size() + " people.");
        return time;
    }
}

class Response {
    private long protobufAverage;
    private long jsonAverage;

    public Response(long protobufAverage, long jsonAverage) {
        this.protobufAverage = protobufAverage;
        this.jsonAverage = jsonAverage;
    }

    public long getProtobufAverage() {
        return protobufAverage;
    }

    public long getJsonAverage() {
        return jsonAverage;
    }
}
