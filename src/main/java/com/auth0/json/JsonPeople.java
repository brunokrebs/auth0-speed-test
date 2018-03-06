package com.auth0.json;

import lombok.Getter;
import lombok.Setter;

import java.util.Collections;
import java.util.List;

@Getter
@Setter
public class JsonPeople {
    private List<JsonPerson> person = Collections.emptyList();
}


