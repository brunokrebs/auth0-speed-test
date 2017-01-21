# Protobuf / JSON comparison

## Test sample

The data used to extract the results below were generated once during the startup process of the Spring Boot application.
It were generated 50 thousand people with "random data" and the following table exposes the data size that got sent through
the wire on each request.

|          | gzipped size | non-gzipped size |
|----------|--------------|------------------|
| protobuf |     1.0mb    |       8.9mb      |
| json     |     1.1mb    |      12.6mb      |

On a gzipped environment, protobuf payload was only 10% smaller, but on a non-gizzped env it was 30% smaller.

## Front-end communicating with Java backend results

The following results were extracted from executing 15 requests per protocol on the test sample.

|          | gzipped time (avg) | non-gzipped time (avg) |
|----------|--------------|------------------|
| protobuf |     575ms    |       460ms      |
| json     |     790ms    |       921ms      |

As we can see, when issuing requests from a JavaScript front-end app with protobuf.js it took us 72% of the time that 
it took on a json request. On a non-gzipped environment we were able to handle it even faster, it took only 49% of the 
time to handle a protobuf response compared to a json response.

## Two Java backends communicating results

The following results were extracted from executing 40 requests per protocol on the test sample.

|          | gzipped time (avg) | non-gzipped time (avg) |
|----------|--------------|------------------|
| protobuf |     234ms    |       146ms      |
| json     |     701ms    |       590ms      |

For my surprise - and I believe everyone else's surprise - the Java backend test, communicating through a non-gzipped 
channel, got better results than the tests using gzip. Nevertheless, on both cases the Protobuf performance was *much*
better. On the gzipped case, Protobuf took only 33% of the time that JSON took. On the non-gzipped case, Protobuf took
24% of the time that JSON took.

## Advantages and disadvantages

- Disadvantage: very few examples and poor documentation
- Disadvantage: much smaller community (json tag: ~180.000; protobuf: ~200)
- Advantage: 10 to 30% smaller payload
- Advantage: 30 to 50% faster to be able to handle data

## Generating protobuf files

The command below generates protobuf files for Java and also Javascript. You will ne to regenerate these files *only* if
you change the `./src/main/resources/people.proto` file or if you add new messages descriptions (new `.proto` files).

```bash
protoc --java_out=./src/main/java/ \
       --js_out=library=/src/main/resources/static/people,binary:. \
       ./src/main/resources/people.proto
```
