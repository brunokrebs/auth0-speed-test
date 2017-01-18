package com.auth0;

public class Address {
    private String street;
    private int number;
    private String country;

    public Address(String street, int number, String country) {
        this.street = street;
        this.number = number;
        this.country = country;
    }

    public String getStreet() { return street; }

    public int getNumber() { return number; }

    public String getCountry() { return country; }
}
