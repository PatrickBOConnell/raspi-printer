#! /usr/bin/python
import printer
import sys

name = str(sys.argv[1])
time = str(sys.argv[2])
reason = str(sys.argv[3])


p=printer.ThermalPrinter(serialport="/dev/ttyAMA0")
p.print_text(name)
p.linefeed()
p.linefeed()
p.linefeed()
p.print_text(time)
p.linefeed()
p.linefeed()
p.linefeed()
p.print_text(reason)
p.linefeed()
p.linefeed()
p.linefeed()
p.linefeed()