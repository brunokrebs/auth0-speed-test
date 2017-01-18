package com.auth0;

public class Person {
    private String name;
    private int age;
    private int height;
    private int weight;
    private Address address;

    public Person(String name, int age, int height, int weight, Address address) {
        this.name = name;
        this.age = age;
        this.height = height;
        this.weight = weight;
        this.address = address;
    }

    public String getName() { return name; }

    public int getAge() { return age; }

    public int getHeight() { return height; }

    public int getWeight() { return weight; }

    public Address getAddress() { return address; }
}
