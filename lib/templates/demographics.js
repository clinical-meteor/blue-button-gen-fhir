"use strict";

var value = require('./value');
var dataTransform = require('./dataTransform');
var postProcess = require('./postProcess');

module.exports = {
    content: {
        resourceType: 'Patient',
        identifier: {
            content: {
                system: {
                    value: function (input) {
                        if (input.match(/^[0-9\.]+$/)) {
                            return "urn:oid:" + input;
                        } else {
                            return input;
                        }
                    },
                    dataKey: 'identifier'
                },
                value: {
                    dataKey: 'extension'
                }
            },
            dataKey: 'identifiers'
        },
        name: {
            content: {
                family: {
                    dataKey: 'last',
                    multiple: true
                },
                given: {
                    arrayContent: [{
                        dataKey: 'first'
                    }, {
                        dataKey: 'middle'
                    }]
                },
                prefix: {
                    dataKey: 'prefix',
                    multiple: true
                },
                suffix: {
                    dataKey: 'suffix',
                    multiple: true
                }
            },
            dataKey: 'name',
            multiple: true
        },
        telecom: {
            arrayContent: [{
                content: {
                    system: 'phone',
                    value: {
                        dataKey: 'number'
                    },
                    use: {
                        value: value.telecomUse,
                        dataKey: 'type'
                    }
                },
                dataKey: 'phone'
            }, {
                content: {
                    system: 'email',
                    value: {
                        dataKey: 'address'
                    }
                },
                dataKey: 'email'
            }]
        },
        gender: {
            value: value.gender,
            dataKey: 'gender'
        },
        birthDate: {
            value: value.date,
            dataKey: 'dob.point'
        },
        address: {
            content: {
                use: {
                    value: value.addressUse,
                    dataKey: "use"
                },
                line: {
                    dataKey: 'street_lines'
                },
                city: {
                    dataKey: 'city'
                },
                state: {
                    dataKey: 'state'
                },
                postalCode: {
                    dataKey: 'zip'
                },
                country: {
                    dataKey: "country"
                }
            },
            dataKey: "addresses"
        },
        maritalStatus: {
            value: value.nameToCodeableConcept("2.16.840.1.113883.5.2"),
            dataKey: 'marital_status'
        },
        communication: {
            content: {
                language: {
                    content: {
                        coding: {
                            content: {
                                code: {
                                    dataKey: 'language'
                                },
                                system: "urn:ietf:params:language"
                            },
                            multiple: true
                        }
                    }
                },
                preferred: {
                    dataKey: 'preferred'
                }
            },
            dataKey: 'languages'
        },
        extension: {
            arrayContent: [{
                value: value.nameToExtensionCodeableConcept("2.16.840.1.113883.5.1076", "http://hl7.org/fhir/StructureDefinition/us-core-religion", "http://hl7.org/fhir/v3/vs/ReligiousAffiliation"),
                dataKey: 'religion'
            }, {
                value: value.nameToExtensionCodeableConcept("2.16.840.1.113883.6.238", "http://hl7.org/fhir/StructureDefinition/us-core-race", "urn:oid:2.16.840.1.113883.6.238"),
                dataKey: 'race'
            }, {
                value: value.nameToExtensionCodeableConcept("2.16.840.1.113883.6.238", "http://hl7.org/fhir/StructureDefinition/us-core-ethnicity", "urn:oid:2.16.840.1.113883.6.238"),
                dataKey: 'ethnicity'
            }]
        }
    }
};
