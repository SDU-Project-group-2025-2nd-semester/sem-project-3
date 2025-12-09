#ifndef PICOW_IOT_H
#define PICOW_IOT_H

#include <stdint.h>
#include "lwip/err.h"
#include "lwip/ip_addr.h"

#ifdef __cplusplus
extern "C" {
#endif

typedef struct MQTT_CLIENT_T_ MQTT_CLIENT_T;

/* Public API exported by picow_iot.c */
MQTT_CLIENT_T* mqtt_client_init(void);
err_t mqtt_test_connect(MQTT_CLIENT_T *state);
err_t mqtt_test_publish(MQTT_CLIENT_T *state);
void run_dns_lookup(MQTT_CLIENT_T *state);
void mqtt_run_test(MQTT_CLIENT_T *state);

/* Non-static callbacks / helpers (declared because they are non-static in the .c)
	Keep these here only if other translation units need to reference them. */
void mqtt_pub_request_cb(void *arg, err_t err);
void mqtt_sub_request_cb(void *arg, err_t err);
void dns_found(const char *name, const ip_addr_t *ipaddr, void *callback_arg);

#ifdef __cplusplus
}
#endif

#endif // PICOW_IOT_H