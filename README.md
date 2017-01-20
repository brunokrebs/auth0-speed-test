# Protobuf / JSON speed comparison

## Generating protobuf files

The command below generates protobuf files for Java and also Javascript. You will ne to regenerate these files *only* if
you change the `./src/main/resources/people.proto` file or if you add new messages descriptions (new `.proto` files).

```bash
protoc --java_out=./src/main/java/ \
       --js_out=library=/src/main/resources/static/people,binary:. \
       ./src/main/resources/people.proto
```
