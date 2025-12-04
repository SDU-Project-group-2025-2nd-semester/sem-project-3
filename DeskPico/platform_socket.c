/* Minimal POSIX-like socket wrapper using BSD sockets (lwIP / Pico W).
   This relies on the Pico Wi-Fi stack being initialized elsewhere.
*/

#include <sys/types.h>
#include <sys/socket.h>
#include <netdb.h>
#include <unistd.h>
#include <fcntl.h>
#include <string.h>
#include <errno.h>
#include <stdio.h>
#include <arpa/inet.h>
#include <poll.h>

#define CONNECT_TIMEOUT_MS 5000
#define IO_TIMEOUT_MS 5000

int platform_socket_connect(const char *host, int port)
{
    struct addrinfo hints = {0}, *res = NULL, *rp;
    char portstr[8];
    int sock = -1;
    int flags, rv;

    hints.ai_family = AF_UNSPEC;
    hints.ai_socktype = SOCK_STREAM;

    snprintf(portstr, sizeof(portstr), "%d", port);
    if ((rv = getaddrinfo(host, portstr, &hints, &res)) != 0) {
        return -1;
    }

    for (rp = res; rp != NULL; rp = rp->ai_next) {
        sock = socket(rp->ai_family, rp->ai_socktype, rp->ai_protocol);
        if (sock < 0) continue;

        flags = fcntl(sock, F_GETFL, 0);
        fcntl(sock, F_SETFL, flags | O_NONBLOCK);

        if (connect(sock, rp->ai_addr, rp->ai_addrlen) == 0) {
            fcntl(sock, F_SETFL, flags);
            break;
        }

        if (errno == EINPROGRESS) {
            struct pollfd pfd = { .fd = sock, .events = POLLOUT };
            int pres = poll(&pfd, 1, CONNECT_TIMEOUT_MS);
            if (pres > 0 && (pfd.revents & POLLOUT)) {
                int err = 0;
                socklen_t len = sizeof(err);
                if (getsockopt(sock, SOL_SOCKET, SO_ERROR, &err, &len) == 0 && err == 0) {
                    fcntl(sock, F_SETFL, flags);
                    break;
                }
            }
        }

        close(sock);
        sock = -1;
    }

    freeaddrinfo(res);
    if (sock >= 0) {
        struct timeval tv;
        tv.tv_sec = IO_TIMEOUT_MS / 1000;
        tv.tv_usec = (IO_TIMEOUT_MS % 1000) * 1000;
        setsockopt(sock, SOL_SOCKET, SO_RCVTIMEO, &tv, sizeof(tv));
        setsockopt(sock, SOL_SOCKET, SO_SNDTIMEO, &tv, sizeof(tv));
    }

    return sock;
}

int platform_socket_write(int sock, const unsigned char *buf, int len)
{
    int sent = 0;
    while (sent < len) {
        ssize_t s = send(sock, buf + sent, (size_t)(len - sent), 0);
        if (s > 0) {
            sent += (int)s;
            continue;
        }
        if (s == 0) return sent;
        if (errno == EINTR) continue;
        if (errno == EWOULDBLOCK || errno == EAGAIN) {
            continue;
        }
        return -1;
    }
    return sent;
}

int platform_socket_read(int sock, unsigned char *buf, int buflen)
{
    ssize_t r = recv(sock, buf, (size_t)buflen, 0);
    if (r >= 0) return (int)r;
    if (errno == EINTR) return 0;
    return -1;
}

int platform_socket_close(int sock)
{
    if (sock < 0) return 0;
    close(sock);
    return 0;
}