package com.auth0;

import com.auth0.protobuf.Entities;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class ProtobufEndpoint {

    @RequestMapping(path = "/proto-buffer-endpoint", method= RequestMethod.GET)
    public List<Entities.Person> getPerson() {
        return SpeedTestApp.getPeople();
    }
}
