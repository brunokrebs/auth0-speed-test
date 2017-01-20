package com.auth0;

import com.auth0.protobuf.PeopleOuterClass;
import com.auth0.protobuf.PeopleOuterClass.People;
import com.google.protobuf.util.JsonFormat;
import com.mashape.unirest.http.Unirest;
import com.mashape.unirest.http.exceptions.UnirestException;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.util.Date;

@RestController
public class ProtobufEndpoint {

    @RequestMapping(path = "/protobuf/people", method= RequestMethod.GET, produces = "application/x-protobuf")
    public People getPeopleProtobuf() {
        return SpeedTestApp.getPeople();
    }

    @RequestMapping(path = "/json/people", method= RequestMethod.GET, produces = "application/json")
    public People getPeopleJSON() {
        return SpeedTestApp.getPeople();
    }

    @RequestMapping(path = "/protobuf/java", method= RequestMethod.GET)
    public void getProtobufJava() throws UnirestException, IOException {
        long start = (new Date()).getTime();
        People people = People.parseFrom(Unirest.get("http://localhost:8080/protobuf/people").asBinary().getRawBody());
        System.out.println(people.getPersonList().size());
        long time = (new Date()).getTime() - start;
        System.out.println("It took " + time + "ms to load with protobuf.");

        start = (new Date()).getTime();
        JsonFormat.parser().merge(Unirest.get("http://localhost:8080/json/people").asString().getBody(), People.newBuilder());
        System.out.println(people.getPersonList().size());
        time = (new Date()).getTime() - start;
        System.out.println("It took " + time + "ms to load with json.");
    }
}
