/* -*- mode: js2; js2-basic-offset: 4; indent-tabs-mode: nil -*- */
/* Asynchronous Tomboy Search Provider for Gnome Shell
 *
 * Copyright (c) 2011 Casey Harkins <charkins@pobox.com>
 * Copyright (c) 2012 Raphael Rochet <raphael.rochet@gmail.com>

 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */

const Main = imports.ui.main;
const DBus = imports.dbus;
const Lang = imports.lang;
const St = imports.gi.St;
const Gio = imports.gi.Gio;
const Mainloop = imports.mainloop;
const Search = imports.ui.search;
const Gettext = imports.gettext.domain('notesearch@rrochet.fr');
const _ = Gettext.gettext;

const TomboyRemoteControl = {
    name: 'org.gnome.Tomboy.RemoteControl',
    methods: [
        {
            name: 'DisplayNote',
            inSignature: 's',
            outSignature: 'b'
        },{
            name: 'SearchNotes',
            inSignature: 'sb',
            outSignature: 'as'
        },{
            name: 'GetNoteTitle',
            inSignature: 's',
            outSignature: 'a'
        }
    ]
};

/* noteSearchProvider holds the instance of the search provider
 * implementation. If null, the extension is either uninitialized
 * or has been disabled via disable().
 */
var noteSearchProvider = null;

const NoteSearchProvider = new Lang.Class({
    Name: 'NoteSearchProvider',
    Extends: Search.SearchProvider,


    _init: function(name) {
        this.parent(_("NOTES"));
        this.async = true;
        let notesearch_app_changed = Lang.bind(this, function() {
            this._noteProxy = DBus.makeProxyClass(TomboyRemoteControl);
            this._noteControl = new this._noteProxy(DBus.session,
                'org.gnome.Tomboy',
                '/org/gnome/Tomboy/RemoteControl');
        });

        notesearch_app_changed();

        this.connect('changed::app', notesearch_app_changed);

        this._id = 0;
    },

    /* get the title and icon for a search result */
    getResultMetas: function(results, callback) {
        let resultMetas = [];
        for(let i = 0; i < results.length ; i++) { 
            let resultId = results[i];
            let title = results[i]['title'];
            if(!title) title = 'Note';

            resultMetas.push({ 'id': resultId,
                     'name': title,
                     'createIcon': function(size) {
                        let xicon = new Gio.ThemedIcon({name: 'tomboy'});
                        return new St.Icon({icon_size: size,
                                            gicon: xicon});
                     }

                   });
        }
        
        callback(resultMetas);
    },

    /* display a note with search terms highlighted */
    activateResult: function(id) {
        this._noteControl.DisplayNoteRemote(id.uri, function(reply,err) {});
    },

    /* start asynchronous search for terms */
    getInitialResultSet: function(terms) {
        this._id = this._id + 1;
        let searchId = this._id;
        let searchString = terms.join(' ');
    
        this._noteControl.SearchNotesRemote(searchString, false, Lang.bind(this,
            function(result, err) {
                if(result==null || result.length==null) {
                    return;
                }
                
                if(result.length==0) {
                    this.searchSystem.pushResults(this, []);
                }
                
                let searchResults = [];
                let searchCount = result.length;

                for (let i = 0; i < searchCount; i++) {
                    let r = result[i]
                    this._noteControl.GetNoteTitleRemote(r, Lang.bind(this,
                        function(title, err) {
                            searchResults.push({
                                    'uri': r,
                                    'title': title,
                                    'search': searchString
                            });

                            /* once we have all results, post them if this is still the current search */
                            if(searchResults.length == searchCount && this._id == searchId) {
                                this.searchSystem.pushResults(this, searchResults);
                            }
                        }
                    ));
                }
            }
        ), DBus.CALL_FLAG_START);

    },

    /* Tomboy doesn't provide a way for subsearching results, so
     * start with a fresh search, cancelling any previous running
     * asynchronous search. */
    getSubsearchResultSet: function(previousResults, terms) {        
        this.getInitialResultSet(terms);
    },

    /* Cancel previous asynchronous search, called from tryCancelAsync(). */
    _asyncCancelled: function() {
        this._id = this._id + 1;
    }

});

function init() {
}

function enable() {
    if(noteSearchProvider==null) {
        noteSearchProvider = new NoteSearchProvider();
        Main.overview.addSearchProvider(noteSearchProvider);
    }
}

function disable() {
    if(noteSearchProvider!=null) {
        Main.overview.removeSearchProvider(noteSearchProvider);
        noteSearchProvider = null;
    }
}
