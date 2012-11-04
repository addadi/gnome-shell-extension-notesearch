Note Search Provider
=====================
A gnome-shell extension which searches [Gnote][1] notes and
provides them in your shell overview. This extension requires at least
version 3.6 of gnome-shell.

### Installation
* Install like any other extension
* enable extension (e.g. via extensions.gnome.org)

### Gnote Without Tray Icon
If you are using Gnote without the tray icon (default in 0.8.0 and 0.8.1),
you may want to apply the patch listed in [bug #653447][2]. This
extension will attempt to launch Gnote if it is not already running using
dbus activation. The default behavior of Gnote without the tray icon is
to display the window to search all notes. It is unlikely that this is
what you want when using this extension. The patch will add a new command
line option for running Gnote in the background and will use it when
activated via dbus. Alternatively, enable the tray icon until some form
of background support is merged upstream.

### Future
Version 3.4 of gnome-shell now allows applications to provide search
results by implementing a dbus interface. Ideally, gnote and tomboy
would implement this interface directly, eliminating a need for this
extension.

### Change log
The original work by Casey Harkins gave me headache, too complex for me. I 
simplified install process and removed tombox support. Also fixed a bug
when there was no more matches.

### License
Copyright (c) 2011-2012 Casey Harkins <charkins@pobox.com>
Copyright (c) 2012 Raphael Rochet <raphael.rochet@gmail.com>

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.

[1]: https://live.gnome.org/Gnote
[2]: https://bugzilla.gnome.org/show_bug.cgi?id=653447
