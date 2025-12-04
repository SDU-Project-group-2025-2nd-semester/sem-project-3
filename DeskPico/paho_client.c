#include <string.h>
#include <stdint.h>
#include <stdio.h>

#include "MQTTPacket.h"
#include "MQTTConnect.h"
#include "MQTTPublish.h"
#include "MQTTDisconnect.h"

/* Platform socket wrapper - you must implement these for Pico W */
extern int platform_socket_connect(const char *host, int port);
extern int platform_socket_write(int sock, const unsigned char *buf, int len);
extern int platform_socket_close(int sock);

/* Publish a single message: connect -> publish -> disconnect */
int paho_publish_one(const char *host, int port, const char *clientID, const char *topic, const char *payload)
{
    unsigned char buf[512];
    int buflen = (int)sizeof(buf);
    int len = 0;
    int rc;

    /* CONNECT */
    MQTTPacket_connectData data = MQTTPacket_connectData_initializer;
    data.clientID.cstring = (char *)clientID;
    data.keepAliveInterval = 20;
    data.cleansession = 1;
    len = MQTTSerialize_connect(buf, buflen, &data);
    if (len <= 0) return -1;

    /* PUBLISH */
    MQTTString topicString = MQTTString_initializer;
    topicString.cstring = (char *)topic;
    int payloadlen = (int)strlen(payload);
    int r = MQTTSerialize_publish(buf + len, buflen - len,
                                  0,    /* dup */
                                  0,    /* qos */
                                  0,    /* retained */
                                  0,    /* packetid (for qos > 0) */
                                  topicString,
                                  (unsigned char *)payload,
                                  payloadlen);
    if (r <= 0) return -2;
    len += r;

    /* DISCONNECT */
    r = MQTTSerialize_disconnect(buf + len, buflen - len);
    if (r <= 0) return -3;
    len += r;

    /* Send to broker */
    int sock = platform_socket_connect(host, port);
    if (sock < 0) return -4;

    rc = platform_socket_write(sock, buf, len);
    platform_socket_close(sock);

    return rc;
}