#ifndef MQTTCLIENT_H
#define MQTTCLIENT_H

#include <stdint.h>
#include "lwip/err.h"
#include "lwip/ip_addr.h"

#ifdef __cplusplus
extern "C" {
#endif
#include <lwip/apps/mqtt.h>

//typedef struct MQTT_CLIENT_T_ MQTT_CLIENT_T;
typedef struct MQTT_CLIENT_T_ {
	ip_addr_t remote_addr;
	mqtt_client_t *mqtt_client;
	uint32_t received;
	uint32_t counter;
	uint32_t reconnect;
	char message[1025];
} MQTT_CLIENT_T;

/* Public API exported by MqttClient.c */
MQTT_CLIENT_T* mqtt_client_init(void);
err_t mqtt_test_connect(MQTT_CLIENT_T *state);
err_t mqtt_test_publish(MQTT_CLIENT_T *state);
void run_dns_lookup(MQTT_CLIENT_T *state);
void mqtt_run_test(MQTT_CLIENT_T *state);
void mqtt_create_client(MQTT_CLIENT_T *state);
void mqtt_subscribe_to_topics(MQTT_CLIENT_T *state);
void mqtt_wait_for_connection(MQTT_CLIENT_T *state);

/* Non-static callbacks / helpers (declared because they are non-static in the .c)
	Keep these here only if other translation units need to reference them. */
void mqtt_pub_request_cb(void *arg, err_t err);
void mqtt_sub_request_cb(void *arg, err_t err);
void dns_found(const char *name, const ip_addr_t *ipaddr, void *callback_arg);

#ifdef __cplusplus
}
#endif

#endif // PICOW_IOT_H