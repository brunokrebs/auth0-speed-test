package com.auth0;

import com.auth0.protobuf.PeopleOuterClass.People;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

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
}
