#!/usr/bin/python

import printer

p = printer.ThermalPrinter(serialport="/dev/ttyAMA0")
p.print_text("\nThis is a test!\n")
p.linefeed()
p.linefeed()
p.linefeed()
p.linefeed()
