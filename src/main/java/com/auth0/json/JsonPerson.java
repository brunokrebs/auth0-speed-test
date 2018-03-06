package com.auth0.json;

import lombok.Getter;
import lombok.Setter;

import java.util.Collections;
import java.util.List;

@Getter
@Setter
public class JsonPerson {
    private String name;
    private List<JsonAddress> address = Collections.emptyList();
    private List<String> mobile = Collections.emptyList();
    private List<String> email = Collections.emptyList();
}
