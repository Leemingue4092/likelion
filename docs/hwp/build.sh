#!/bin/sh
set -eu
root=$(CDPATH= cd -- "$(dirname "$0")/../.." && pwd)
jar=/tmp/hwplib/hwplib-1.1.10.jar
if [ ! -f "$jar" ]; then
  mkdir -p /tmp/hwplib
  curl -fsSL -o "$jar" https://repo1.maven.org/maven2/kr/dogfoot/hwplib/1.1.10/hwplib-1.1.10.jar
fi
mkdir -p /tmp/hwpbuild
javac -encoding UTF-8 -cp "$jar" -d /tmp/hwpbuild "$root/docs/hwp/BuildAdderReport.java"
java -cp "/tmp/hwpbuild:$jar" BuildAdderReport "$root/docs" \
  "$root/docs/20234092_이민규_회로이론실습설계2_실험5_가산기.hwp"
