package com.auth0;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class JSONEndpoint {

    @RequestMapping(path = "/json-endpoint", method= RequestMethod.GET)
    public Person getPerson() {
        return new Person("Bruno", 32,182, 82, null);
    }
}