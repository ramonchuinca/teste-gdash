FROM golang:1.22-alpine AS build

WORKDIR /app
RUN apk add --no-cache git

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 go build -o /worker .

FROM alpine:3.18
RUN apk add --no-cache ca-certificates
COPY --from=build /worker /usr/local/bin/worker
CMD ["/usr/local/bin/worker"]
