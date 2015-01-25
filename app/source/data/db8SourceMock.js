enyo.kind({
    name: "db8SourceMock",
    kind: "enyo.Source",

    fetch: function(rec, opts) {
        var i;
        console.log("==> Fetch called...");

        if (rec instanceof enyo.Model) {
            /* not sure if this if part even gets called or works properly.... */
            console.log("rec is instanceof enyo.Model");
            for (i = 0; i < this.dataArray.length; i += 1) {
                console.log("Model rec " + this.dataArray[i]);
                if (this.dataArray[i]._id === rec.attributes[rec.primaryKey]) {
                    opts.success([this.dataArray[i]]);
                    return;
                }
            }

            //I think that is what db8 does, isn't it?
            opts.success([]);
        } else if (rec instanceof enyo.Collection) {
            dbkind = rec.get("dbKind");

            if (dbkind === "com.palm.message:1") {
                threadId = rec.get("threadId");
                console.log("Collection threadId: " + threadId);
                opts.success(this.dataArray[dbkind][threadId]);
            }
            else if (dbkind === "com.palm.chatthread:1") {
                console.log("dbKind is com.palm.chatthread:1", opts, this.dataArray[dbkind]);
                opts.success(this.dataArray[dbkind]);
            }
            else if (dbkind === "com.palm.person:1") {
                console.log("dbKind is com.palm.person:1", opts, this.dataArray[dbkind]);
                opts.success(this.dataArray[dbkind]);
            }
            else {
                console.log("dbKind is none of above");
                opts.success([]);
            }
        } else {
            //return all dataArray here:
            console.log("return " + JSON.stringify(this.dataArray));
            opts.success(this.dataArray);
        }
    },

    commit: function(rec, opts) {
        console.log("COMMITTING", rec, opts);
        var i;
        console.log("Storing ", rec, (rec instanceof enyo.Model), rec.get("dbKind") );

        if (rec instanceof enyo.Model) {
            dbkind = rec.get("dbKind")||rec.dbKind;

            if (dbkind === "com.palm.message:1") {
                threadId = rec.get("threadId")||opts.threadId;
                console.log("threadId: ", threadId);
                //opts.success(this.dataArray[dbkind][threadId]);
                var dataArray = this.dataArray["com.palm.message:1"][threadId];
                if (!dataArray) {
                    dataArray = this.dataArray["com.palm.message:1"][threadId] = [];
                }

                console.log("dataArray says", dataArray);
                for (i = 0; i < dataArray.length; i += 1) {
                    if (dataArray[i]._id === rec.attributes[rec.primaryKey]) {
                        dataArray[i] = rec.attributes;
                        opts.success({returnValue: true});
                        return;
                    }
                }
                rec.set("_id", dataArray.length);
                dataArray.push(rec.raw());
                console.log("SUCCESSWITHCOMMITT", this.dataArray);
                opts.success({returnValue: true});

            }
            else if (dbkind === "com.palm.chatthread:1") {

                var dataArray = this.dataArray["com.palm.chatthread:1"];
                for (i = 0; i < dataArray.length; i += 1) {
                    if (dataArray[i].personId === rec.get("personId")) {
                        opts.success({returnValue: true});
                        return;
                    }
                }
                rec.set("_id", dataArray.length);
                dataArray.push(rec.raw());
                console.log("SUCCESSWITHCOMMITT", this.dataArray);
                opts.success({returnValue: true});

            }
            else {
                opts.success([]);
            }

        } else {
            console.log("Can't store collection... still makes me headaches.");
            opts.fail();
        }
    },
    destroy: function(rec, opts) {
        var ids;

        if (rec instanceof enyo.Collection) {
            ids = [];
            rec.records.forEach(function (m) {
                var i;
                for (i = this.dataArray.length - 1; i >= 0; i -= 1) {
                    if (this.dataArray[i]._id === m.attributes[m.primaryKey]) {
                        this.dataArray.splice(i, 1);
                    }
                }
            });
        } else {
            ids = [rec.attributes[rec.primaryKey]];
        }
    },
    find: function(rec, opts) {
        console.log("No find..");
        opts.fail();
    },
    getIds: function (n, opts) {
        var ids = [], i;
        for (i = 0; i < n; i += 1) {
            ids.push(Date.now() + i);
        }
        opts.success({returnValue: true, ids: [ids]});
    },



    dataArray: {
        "com.palm.chatthread:1": [
            { _id: "0", displayName: "Person1 WithReallySuperLongName", summary: "Summary of message from Person 1",
                timestamp: 1408101740, replyAddress: "0144334456", replyService: "sms", personId: "", unreadCount: 2},
            { _id: "1", displayName: "Person 2", summary: "Summary of message from Person 2",
                timestamp: 1409610140, replyAddress: "0144334456", replyService: "sms", personId: "", unreadCount: 0},
            { _id: "2", displayName: "Person 3", summary: "Summary of messages from Person 3, for whom there are no messages " +
                "in thread. But we have a really long summary in any case to see if ellipsis works",
                timestamp: 1409610140, replyAddress: "1234334456", replyService: "sms", personId: "", unreadCount: 0}
        ],
        "com.palm.message:1": {
            "0": [
                { _id: "0", _kind: "com.palm.smsmessage:1", conversations: ["0"], folder: "inbox", 
                  from: { addr: "+491234567890" }, localTimestamp: 1408101740, messageText: "This is a small SMS test message 1 from Someone",
                  networkMsgId: 0, priority: 0, serviceName: "sms", smsType: 0, status: "successful", timestamp: 0 },
                { _id: "1", _kind: "com.palm.smsmessage:1", conversations: ["1"], folder: "sent",
                  from: { addr: "+491234567890" }, localTimestamp: 1408601740, messageText: "This is a extremely large " +
                    "SMS test message 2 TO Someone. Like I said, this is a <i>extremely</i> large message " +
                    "that also has some HTML formatting in it. <b><u>Just because we can!</u></b> Plus, we " +
                    "need to <span style='color:maroon;'>check support for auto-expansion</span> of message.",
                  networkMsgId: 0, priority: 0, serviceName: "sms", smsType: 0, status: "successful", timestamp: 0 },
                { _id: "4", _kind: "com.palm.smsmessage:1", conversations: ["1"], folder: "inbox",
                    from: { addr: "+491234567890" }, localTimestamp: 1408601740, messageText: "This is a small SMS test message 5, also from Someone",
                    networkMsgId: 0, priority: 0, serviceName: "sms", smsType: 0, status: "successful", timestamp: 0 }
            ],
            "1": [
                { _id: "2", _kind: "com.palm.smsmessage:1", conversations: ["0"], folder: "inbox",
                  from: { addr: "+491234567890" }, localTimestamp: 0, messageText: "This is a small SMS test message 3 from test2",
                  networkMsgId: 0, priority: 0, serviceName: "sms", smsType: 0, status: "successful", timestamp: 0 },
                { _id: "3", _kind: "com.palm.smsmessage:1", conversations: ["1"], folder: "inbox",
                  from: { addr: "+491234567890" }, localTimestamp: 0, messageText: "This is a small SMS test message 4, also from test2",
                  networkMsgId: 0, priority: 0, serviceName: "sms", smsType: 0, status: "successful", timestamp: 0 }
            ]
        },
        "com.palm.person:1":[
        {
            "_id": "J1EcwkckJBw",
            "_kind": "com.palm.person:1",
            "_rev": 344,
            "addresses": [{
                "_id": "130",
                "country": "",
                "locality": "",
                "postalCode": "\\.. ",
                "primary": false,
                "region": "dassa'.,",
                "streetAddress": "Neueaddresse.:",
                "type": "type_work"
            }, {
                "_id": "131",
                "country": "",
                "locality": "",
                "postalCode": "",
                "primary": false,
                "region": "",
                "streetAddress": "., ",
                "type": "type_home"
            }, {
                "_id": "12c",
                "country": "USE",
                "locality": "",
                "postalCode": "",
                "primary": false,
                "region": "somewhere.m irgendwo",
                "streetAddress": "",
                "type": "type_work"
            }],
            "anniversary": "2014-09-01",
            "birthday": "2014-07-12",
            "contactIds": ["J1EcwYUFwGV", "J1EcwYUFYEg"],
            "emails": [{
                "_id": "132",
                "favoriteData": {},
                "normalizedValue": "test@blub.de",
                "primary": false,
                "type": "type_work",
                "value": "test@blub.de"
            }],
            "favorite": false,
            "gender": "",
            "ims": [],
            "launcherId": "",
            "name": {
                "familyName": "schlubbeltub",
                "givenName": "test-zu-owo",
                "honorificPrefix": "",
                "honorificSuffix": "",
                "middleName": ""
            },
            "names": [{
                "_id": "159",
                "familyName": "schlubbeltub",
                "givenName": "test-zu-owo",
                "honorificPrefix": "",
                "honorificSuffix": "",
                "middleName": ""
            }, {
                "_id": "15a",
                "familyName": "",
                "givenName": "test-zu-owo",
                "honorificPrefix": "",
                "honorificSuffix": "",
                "middleName": ""
            }],
            "nickname": "",
            "notes": [",.öäü\\?ß!\"&lt;&gt;&amp; does this read ok?"],
            "organization": {
                "department": "",
                "description": "",
                "endDate": "",
                "location": {
                    "country": "",
                    "locality": "",
                    "postalCode": "",
                    "primary": false,
                    "region": "",
                    "streetAddress": "",
                    "type": "type_work"
                },
                "name": "Kentucky Fried Chicken/KFC",
                "startDate": "",
                "title": "",
                "type": ""
            },
            "phoneNumbers": [],
            "photos": {
                "accountId": "",
                "bigPhotoId": "",
                "bigPhotoPath": "",
                "contactId": "",
                "listPhotoPath": "",
                "listPhotoSource": "",
                "squarePhotoId": "",
                "squarePhotoPath": ""
            },
            "relations": [{
                "_id": "133",
                "primary": false,
                "type": "type_spouse",
                "value": "Test spiuse"
            }, {
                "_id": "134",
                "primary": false,
                "type": "type_child",
                "value": "Test child"
            }],
            "reminder": "",
            "ringtone": {
                "location": "",
                "name": ""
            },
            "searchTerms": ["tschlubbeltub", "schlubbeltubtest-zu-owo"],
            "sortKey": "schlubbeltub\ttest-zu-owo",
            "urls": [{
                "_id": "135",
                "primary": false,
                "type": "type_other",
                "value": "Https://scrounge.dumpf"
            }, {
                "_id": "12e",
                "primary": false,
                "type": "type_other",
                "value": "http://workurl.de"
            }]
        },

            {
                "_id": "J1EcwpjkP_k",
                "_kind": "com.palm.person:1",
                "_rev": 347,
                "addresses": [],
                "anniversary": "",
                "birthday": "",
                "contactIds": ["J1EcwYUG8r3"],
                "emails": [],
                "favorite": false,
                "gender": "",
                "ims": [],
                "launcherId": "",
                "name": {
                    "familyName": "Anders",
                    "givenName": "Was",
                    "honorificPrefix": "",
                    "honorificSuffix": "",
                    "middleName": "Gaaaanz"
                },
                "names": [{
                    "_id": "15c",
                    "familyName": "Anders",
                    "givenName": "Was",
                    "honorificPrefix": "",
                    "honorificSuffix": "",
                    "middleName": "Gaaaanz"
                }],
                "nickname": "Way too long a nickname for any normal person, this entry exists to test the details layout",
                "notes": [],
                "organization": {
                    "department": "",
                    "description": "",
                    "endDate": "",
                    "location": {
                        "country": "",
                        "locality": "",
                        "postalCode": "",
                        "primary": false,
                        "region": "",
                        "streetAddress": "",
                        "type": "type_work"
                    },
                    "name": "National Public Radio / NPR",
                    "startDate": "",
                    "title": "",
                    "type": ""
                },
                "phoneNumbers": [{
                    "_id": "137",
                    "favoriteData": {},
                    "normalizedValue": "-0989898989898-898--",
                    "primary": false,
                    "speedDial": "",
                    "type": "type_mobile",
                    "value": "8988989898989890"
                }, {
                    "_id": "138",
                    "favoriteData": {},
                    "normalizedValue": "-6543643253465345324-123--",
                    "primary": false,
                    "speedDial": "",
                    "type": "type_mobile",
                    "value": "13214235435643523463456"
                }],
                "photos": {
                    "accountId": "",
                    "bigPhotoId": "",
                    "bigPhotoPath": "",
                    "contactId": "",
                    "listPhotoPath": "",
                    "listPhotoSource": "",
                    "squarePhotoId": "",
                    "squarePhotoPath": ""
                },
                "relations": [],
                "reminder": "",
                "ringtone": {
                    "location": "",
                    "name": ""
                },
                "searchTerms": ["wanders", "anderswas"],
                "sortKey": "anders\twas",
                "urls": []
            }, {
                "_id": "J1Ecws+LFLJ",
                "_kind": "com.palm.person:1",
                "_rev": 352,
                "addresses": [],
                "anniversary": "",
                "birthday": "",
                "contactIds": ["J1EcwYUGPKN"],
                "emails": [{
                    "_id": "13a",
                    "favoriteData": {},
                    "normalizedValue": "blabbel@test.nix",
                    "primary": false,
                    "type": "type_home",
                    "value": "blabbel@test.nix"
                }],
                "favorite": false,
                "gender": "",
                "ims": [],
                "launcherId": "",
                "name": {
                    "familyName": "Hoch",
                    "givenName": "Test",
                    "honorificPrefix": "",
                    "honorificSuffix": "",
                    "middleName": ""
                },
                "names": [{
                    "_id": "161",
                    "familyName": "Hoch",
                    "givenName": "Test",
                    "honorificPrefix": "",
                    "honorificSuffix": "",
                    "middleName": ""
                }],
                "nickname": "",
                "notes": [],
                "organization": {
                    "department": "",
                    "description": "",
                    "endDate": "",
                    "location": {
                        "country": "",
                        "locality": "",
                        "postalCode": "",
                        "primary": false,
                        "region": "",
                        "streetAddress": "",
                        "type": "type_work"
                    },
                    "name": "",
                    "startDate": "",
                    "title": "",
                    "type": ""
                },
                "phoneNumbers": [],
                "photos": {
                    "accountId": "",
                    "bigPhotoId": "",
                    "bigPhotoPath": "",
                    "contactId": "",
                    "listPhotoPath": "",
                    "listPhotoSource": "",
                    "squarePhotoId": "",
                    "squarePhotoPath": ""
                },
                "relations": [],
                "reminder": "",
                "ringtone": {
                    "location": "",
                    "name": ""
                },
                "searchTerms": ["thoch", "hochtest"],
                "sortKey": "hoch\ttest",
                "urls": []
            }, {
                "_id": "J1EcwtI22Yc",
                "_kind": "com.palm.person:1",
                "_rev": 354,
                "addresses": [],
                "anniversary": "",
                "birthday": "",
                "contactIds": ["J1EcwYUGjSR"],
                "emails": [],
                "favorite": false,
                "gender": "",
                "ims": [],
                "launcherId": "",
                "name": {
                    "familyName": "runter",
                    "givenName": "test",
                    "honorificPrefix": "",
                    "honorificSuffix": "",
                    "middleName": ""
                },
                "names": [{
                    "_id": "163",
                    "familyName": "runter",
                    "givenName": "test",
                    "honorificPrefix": "",
                    "honorificSuffix": "",
                    "middleName": ""
                }],
                "nickname": "",
                "notes": [],
                "organization": {
                    "department": "",
                    "description": "",
                    "endDate": "",
                    "location": {
                        "country": "",
                        "locality": "",
                        "postalCode": "",
                        "primary": false,
                        "region": "",
                        "streetAddress": "",
                        "type": "type_work"
                    },
                    "name": "",
                    "startDate": "",
                    "title": "",
                    "type": ""
                },
                "phoneNumbers": [{
                    "_id": "13c",
                    "favoriteData": {},
                    "normalizedValue": "-324435435-688--",
                    "primary": false,
                    "speedDial": "",
                    "type": "type_home",
                    "value": "886534534423"
                }],
                "photos": {
                    "accountId": "",
                    "bigPhotoId": "",
                    "bigPhotoPath": "",
                    "contactId": "",
                    "listPhotoPath": "",
                    "listPhotoSource": "",
                    "squarePhotoId": "",
                    "squarePhotoPath": ""
                },
                "relations": [],
                "reminder": "",
                "ringtone": {
                    "location": "",
                    "name": ""
                },
                "searchTerms": ["trunter", "runtertest"],
                "sortKey": "runter\ttest",
                "urls": []
            }, {
                "_id": "J1EcwuraPig",
                "_kind": "com.palm.person:1",
                "_rev": 356,
                "addresses": [],
                "anniversary": "",
                "birthday": "",
                "contactIds": ["J1EcwYUGWgF"],
                "emails": [{
                    "_id": "13e",
                    "favoriteData": {},
                    "normalizedValue": "adashakdasd@ada.eqaeaw",
                    "primary": false,
                    "type": "type_home",
                    "value": "adashakdasd@ada.eqaeaw"
                }],
                "favorite": false,
                "gender": "",
                "ims": [],
                "launcherId": "",
                "name": {
                    "familyName": "kopf",
                    "givenName": "nupf",
                    "honorificPrefix": "",
                    "honorificSuffix": "",
                    "middleName": ""
                },
                "names": [{
                    "_id": "165",
                    "familyName": "kopf",
                    "givenName": "nupf",
                    "honorificPrefix": "",
                    "honorificSuffix": "",
                    "middleName": ""
                }],
                "nickname": "",
                "notes": [],
                "organization": {
                    "department": "",
                    "description": "",
                    "endDate": "",
                    "location": {
                        "country": "",
                        "locality": "",
                        "postalCode": "",
                        "primary": false,
                        "region": "",
                        "streetAddress": "",
                        "type": "type_work"
                    },
                    "name": "",
                    "startDate": "",
                    "title": "",
                    "type": ""
                },
                "phoneNumbers": [],
                "photos": {
                    "accountId": "",
                    "bigPhotoId": "",
                    "bigPhotoPath": "",
                    "contactId": "",
                    "listPhotoPath": "",
                    "listPhotoSource": "",
                    "squarePhotoId": "",
                    "squarePhotoPath": ""
                },
                "relations": [],
                "reminder": "",
                "ringtone": {
                    "location": "",
                    "name": ""
                },
                "searchTerms": ["nkopf", "kopfnupf"],
                "sortKey": "kopf\tnupf",
                "urls": []
            }, {
                "_id": "J1EcwwUH33V",
                "_kind": "com.palm.person:1",
                "_rev": 358,
                "addresses": [],
                "anniversary": "",
                "birthday": "",
                "contactIds": ["J1EcwYUGmPo"],
                "emails": [],
                "favorite": false,
                "gender": "",
                "ims": [],
                "launcherId": "",
                "name": {
                    "familyName": "Njam",
                    "givenName": "Njam",
                    "honorificPrefix": "",
                    "honorificSuffix": "",
                    "middleName": ""
                },
                "names": [{
                    "_id": "167",
                    "familyName": "Njam",
                    "givenName": "Njam",
                    "honorificPrefix": "",
                    "honorificSuffix": "",
                    "middleName": ""
                }],
                "nickname": "",
                "notes": [],
                "organization": {
                    "department": "",
                    "description": "",
                    "endDate": "",
                    "location": {
                        "country": "",
                        "locality": "",
                        "postalCode": "",
                        "primary": false,
                        "region": "",
                        "streetAddress": "",
                        "type": "type_work"
                    },
                    "name": "",
                    "startDate": "",
                    "title": "",
                    "type": ""
                },
                "phoneNumbers": [{
                    "_id": "140",
                    "favoriteData": {},
                    "normalizedValue": "-098797898779808-708--",
                    "primary": false,
                    "speedDial": "",
                    "type": "type_mobile",
                    "value": "8-0780897789879--7890"
                }],
                "photos": {
                    "accountId": "",
                    "bigPhotoId": "",
                    "bigPhotoPath": "",
                    "contactId": "",
                    "listPhotoPath": "",
                    "listPhotoSource": "",
                    "squarePhotoId": "",
                    "squarePhotoPath": ""
                },
                "relations": [],
                "reminder": "",
                "ringtone": {
                    "location": "",
                    "name": ""
                },
                "searchTerms": ["nnjam", "njamnjam"],
                "sortKey": "njam\tnjam",
                "urls": []
            },
// record with minimal required fields
// It's not a problem if such a record is not displayed.
            {
                _id: "kljfldfjkkei",
                _kind: "com.palm.person:1",
                _rev: 1,
                addresses: [],
                anniversary: "",
                birthday: "",
                contactIds: [],
                favorite: false,
                gender: "undisclosed",
                name: {},
                names: [],
                notes: [],
                photos: {
                    accountId: "",
                    contactId: "",
                    listPhotoSource: "type_square",
                    listPhotoPath: "",
                    bigPhotoId: "",
                    squarePhotoId: ""
                },
                reminder: "",
                ringtone: [],
                searchTerms: [],
                sortKey: "",
                urls: []
            },
// long name; should be searchable by any word in given, middle or family name
            {
                _id: "icddeioxwo",
                _kind: "com.palm.person:1",
                _rev: 1,
                addresses: [],
                anniversary: "",
                birthday: "",
                contactIds: [],
                emails: [{normalizedValue: "schmidt.1234@osu.edu", type: "type_home", value: "schmidt.1234@osu.edu"}],
                favorite: true,
                gender: "male",
                name: {familyName: "Schmidt", givenName: "John", honorificPrefix: "Herr Dr. Dr.", honorificSuffix: "jünger", middleName: "Jacob Jingleheimer"},
                names: [{familyName: "Schmidt", givenName: "John", honorificPrefix: "Herr Dr. Dr.", honorificSuffix: "jünger", middleName: "Jacob Jingleheimer"}],
                nickname: "Bärchen",
                notes: [],
                organization: {title: "Meisterbürger", department: "Büro Fahren", name: "Tauberbischofsheeim"},
                photos: {
                    accountId: "",
                    contactId: "",
                    listPhotoSource: "type_square",
                    listPhotoPath: "",
                    bigPhotoId: "",
                    squarePhotoId: ""
                },
                reminder: "",
                ringtone: [],
                searchTerms: ["schmidtjohn", "jschmidt"],
                sortKey: "",
                urls: []
            },
// hyphenated family name; should be searchable by either part
            {
                _id: "iiiofdofdofdf",
                _kind: "com.palm.person:1",
                _rev: 1,
                addresses: [],
                anniversary: "",
                birthday: "",
                contactIds: [],
                favorite: false,
                gender: "undisclosed",
                name: {familyName: "Smythe-Jones", givenName: "Cecil"},
                names: [{familyName: "Smythe-Jones", givenName: "Cecil"}],
                notes: [],
                photos: {
                    accountId: "",
                    contactId: "",
                    listPhotoSource: "type_square",
                    listPhotoPath: "",
                    bigPhotoId: "",
                    squarePhotoId: ""
                },
                reminder: "",
                ringtone: [],
                searchTerms: ["csmythe-jones", "smythe-jonescecil"],
                sortKey: "smythe-jones cecil",
                urls: []
            },
// prefix & given name; should not be searchable by prefix
            {
                _id: "demdmeppep",
                _kind: "com.palm.person:1",
                _rev: 1,
                addresses: [],
                anniversary: "",
                birthday: "",
                contactIds: [],
                favorite: false,
                gender: "undisclosed",
                name: {givenName: "Hrolf", honorificPrefix: "King"},
                names: [{givenName: "Hrolf", honorificPrefix: "King"}],
                notes: [],
                nickname: "Kraki",
                organization: {name: "Kingdom of Denmark", title: "King"},
                photos: {
                    accountId: "",
                    contactId: "",
                    listPhotoSource: "type_square",
                    listPhotoPath: "",
                    bigPhotoId: "",
                    squarePhotoId: ""
                },
                reminder: "",
                ringtone: [],
                searchTerms: [],
                sortKey: "hrolf",
                urls: []
            },
// many notes, also should be searchable by either word in given name
            {
                _id: "ruiriuqwoqoei",
                _kind: "com.palm.person:1",
                _rev: 1,
                addresses: [],
                anniversary: "",
                birthday: "",
                contactIds: [],
                emails: [{normalizedValue: "m_a_notes@example.com", value: "m_a_notes@example.com"}],
                favorite: false,
                gender: "undisclosed",
                ims: [{_id: "lfkjdlfofcxxc", type: "type_yahoo", label: "label_home", favoriteData: {}, normalizedValue: "huggybear", value: "HuggyBear", primary: true }],
                name: {familyName: "Notes", givenName: "Mary Ann"},
                names: [{familyName: "Notes", givenName: "Mary Ann"}],
                notes: ["fie", "fi", "fo", "fum", "I smell the blood", "of an Englishman"],
                photos: {
                    accountId: "",
                    contactId: "",
                    listPhotoSource: "type_square",
                    listPhotoPath: "",
                    bigPhotoId: "",
                    squarePhotoId: ""
                },
                reminder: "",
                ringtone: [],
                searchTerms: ["notesmary ann", "mnotes"],
                sortKey: "notes mary ann",
                urls: []
            },
// nickname but no formal name - should be displayed and searchable by nickname (or IM)
            {
                _id: "mememenrbrbtby",
                _kind: "com.palm.person:1",
                _rev: 1,
                addresses: [],
                anniversary: "",
                birthday: "",
                contactIds: [],
                favorite: false,
                gender: "undisclosed",
                ims: [{_id: "zczczffzvs", type: "type_skype", label: "", favoriteData: {}, value: "Cowboy_Bob", primary: false }],
                name: {},
                names: [],
                nickname: "Lefty",
                notes: [],
                photos: {
                    accountId: "",
                    contactId: "",
                    listPhotoSource: "type_square",
                    listPhotoPath: "",
                    bigPhotoId: "",
                    squarePhotoId: ""
                },
                reminder: "",
                ringtone: [],
                searchTerms: [],
                sortKey: "lefty",
                urls: []
            },
// Chinese name, w/ latin name from a second contact
            {
                _id: "fkjeiddoenvmvoe",
                _kind: "com.palm.person:1",
                _rev: 1,
                addresses: [],
                anniversary: "",
                birthday: "",
                contactIds: ["lfjdalsfjdlfjd", "cchccicicicoxoxokd"],
                favorite: false,
                gender: "undisclosed",
                name: {familyName: "孙", givenName: "七"},
                names: [{familyName: "孙", givenName: "七"}, {familyName: "Sun", givenName: "Seven"}],
                notes: ["“Sun Seven”"],
                photos: {
                    accountId: "",
                    contactId: "",
                    listPhotoSource: "type_square",
                    listPhotoPath: "",
                    bigPhotoId: "",
                    squarePhotoId: ""
                },
                reminder: "",
                ringtone: [],
                searchTerms: ["孙七", "七孙"],
                sortKey: "孙 七",
                urls: []
            },
// compound surnames should be searchable by any word
            {
                _id: "ncncjddifovkckdic",
                _kind: "com.palm.person:1",
                _rev: 1,
                addresses: [],
                anniversary: "",
                birthday: "",
                contactIds: [],
                favorite: false,
                gender: "female",
                name: {familyName: "Lopez Perez de Ramirez", givenName: "Maria"},
                names: [{familyName: "Lopez Perez de Ramirez", givenName: "Maria"}],
                notes: [],
                organization: {name: "A Better Mortgage Co."},
                photos: {
                    accountId: "",
                    contactId: "",
                    listPhotoSource: "type_square",
                    listPhotoPath: "",
                    bigPhotoId: "",
                    squarePhotoId: ""
                },
                reminder: "",
                ringtone: [],
                searchTerms: ["lopez perez de ramirezmaria", "mlopez perez de ramirez"],
                sortKey: "lopez perez de ramirez maria",
                urls: []
            },
// a favorite, with multiple names. Should be searchable by any name
            {
                _id: "lkfjfdfooe",
                _kind: "com.palm.person:1",
                _rev: 1,
                addresses: [],
                anniversary: "",
                birthday: "",
                contactIds: ["ldfjadlkfjdkls", "lkfjdlfjkads", "flkjafljds"],
                emails: [
                    {normalizedValue: "   santa  @  northpole.org", type: "type_work", value: "   santa  @  northpole.org"},
                    {normalizedValue: "   dearsanta  @  northpole.org", type: "type_work", value: "   dearsanta  @  northpole.org"},
                    {normalizedValue: "  wish-fairy   ", type: "type_home", value: "  wish-fairy   "}
                ],
                favorite: true,
                gender: "male",
                name: {familyName: "Kringle", givenName: "Kris"},
                names: [{familyName: "Kringle", givenName: "Kris"}, {familyName: "Claus", givenName: "Santa"}, {givenName: "Nicholas", honorificPrefix: "St."}],
                notes: [],
                organization: {title: "Sleigh Driver, Reindeer Wrangler & Elf Taskmaster", department: "Distribution", name: "The Christmas Conspiracy"},
                photos: {
                    accountId: "lkfdjlfjdsfljds+6",
                    bigPhotoId: "129",
                    bigPhotoPath: "assets/kris_kringle.jpg",
                    contactId: "ldjfldjfdfoo",
                    listPhotoPath: "",
                    listPhotoSource: "",
                    squarePhotoId: "",
                    squarePhotoPath: ""
                },
                reminder: "",
                ringtone: [],
                searchTerms: ["kringlekris", "kkringle"],
                sortKey: "kringle kris",
                urls: []
            }
        ]

    }
});
