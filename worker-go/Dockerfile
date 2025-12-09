# build stage
FROM golang:1.22-alpine AS build

WORKDIR /app
# add git in case some libs require it (alpine)
RUN apk add --no-cache git

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 go build -o /worker .

# final stage
FROM alpine:3.18
RUN apk add --no-cache ca-certificates
COPY --from=build /worker /usr/local/bin/worker
WORKDIR /app
EXPOSE 8080
ENTRYPOINT ["/usr/local/bin/worker"]
