FROM datadog/squid

RUN apt update && apt install -y apache2-utils

RUN htpasswd -b -c /etc/squid/passwords user password

ADD squid.conf /etc/squid/squid.conf

