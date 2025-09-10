#!/bin/bash
# InfluxDB initialization script for K6 metrics

echo "Setting up InfluxDB for K6 metrics..."

# Create database if it doesn't exist
influx -execute "CREATE DATABASE k6"

# Create user if it doesn't exist
influx -execute "CREATE USER k6 WITH PASSWORD 'k6pass'"

# Grant permissions
influx -execute "GRANT ALL ON k6 TO k6"

# Create retention policy for K6 data (30 days)
influx -execute "CREATE RETENTION POLICY k6_retention ON k6 DURATION 30d REPLICATION 1 DEFAULT"

echo "InfluxDB setup for K6 completed!"