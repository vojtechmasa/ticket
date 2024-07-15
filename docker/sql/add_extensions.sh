#!/bin/sh

psql -d postgres -c "create extension if not exists unaccent;"