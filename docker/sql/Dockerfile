# alpine is not possible to use, because its locale doesn't work there
FROM postgres:9
MAINTAINER Vojtech Masa "info@vojtechmasa.com"

RUN localedef -i cs_CZ -c -f UTF-8 -A /usr/share/locale/locale.alias cs_CZ.UTF-8

ADD add_extensions.sh /docker-entrypoint-initdb.d/add_extensions.sh
RUN chmod a+x /docker-entrypoint-initdb.d/add_extensions.sh

#ADD dbDumpPostgres.sql /docker-entrypoint-initdb.d/dbDumpPostgres.sql

ADD postgresql.conf /etc/postgresql/postgresql.conf

ENV LANG cs_CZ.utf8

EXPOSE 5432

# command for ad-hoc db dump:
# pg_dump -U postgres -h localhost -d postgres > /var/lib/postgresql/data/dbDumpPostgres.sql
# you need also uncomment the sql dump file above