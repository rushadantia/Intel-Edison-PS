/********************************************Website Code***************************************************
 const express = require('express');
 const app = express();
 const path = require('path');
 const fs = require('fs');

 app.use(express.static(__dirname + '/'));

 app.get('/', function (req, res) {

    fs.readFile(__dirname + '/template.html','utf8', function(err, data){
        console.log(data)
    });

 res.sendFile(path.join(__dirname + '/index.html'));

});

 app.get('/reboot', function (req, res) {
    res.sendFile(path.join(__dirname + '/reboot.html'));

});

 app.get('/back', function (req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
})
 //app.listen(3000);
 //console.log('website at localhost:3000')
 */
/*********************************************Node Code*****************************************************/
var sensors = [];
const net = require('net');

/**
 * Creates the server that brokers the connections
 */
var server = net.createServer(function (socket) {
    socket.setNoDelay(true);

    socket.on('data', function (data) {

        //reads all incoming data
        const stringData = new Buffer(data).toString();

        console.log(stringData)

        //split it by the delimiter
        const command = stringData.split('-');

        //if the command new node is requested
        if (command[0] == 'nn') {

            //create a new sensor node object
            var sn = new SensorNode(command[1], command[2], command[3], command[4], socket);

            //check to see if the node is already in the list
            if (hasNode(sn) === false) {

                sn.getSensorsToSubTo().forEach(function (s) {
                    socket.write('ct-' + s.getString() + '*');
                });

                sn.getSensorsToPubTo();

                sensors.push(sn);
                console.log('added to list')
            }
        }


    });

    //ignore errors
    socket.on('error', function () {});

});

/**
 * Returns true if we have the node already in out table
 * @param tosee
 * @returns {boolean}
 */
function hasNode(tosee) {

    for (var i = 0; i < sensors.length; i++) {

        if (sensors[i].equals(tosee))
            return true;

    }
    return false;
}


/**
 * Sensor node data type
 * @param hostname
 * @param ip
 * @param sensors
 * @constructor
 */
function SensorNode(hostname, ip, sensors, want, socket) {
    this.hostname = hostname;
    this.ip = ip;
    this.sensors = want !== undefined ? sensors.split(':') : [];
    this.want = want !== undefined ? want.split(':') : [];
    this.socket = socket
}

/**
 * ToString for sensor node
 * @memberof SensorNode
 * @returns {string}
 */
SensorNode.prototype.getString = function () {
    return this.hostname + '-' + this.ip + '-' + this.sensors;
};

/**
 * Returns array of sensors that have something it wants
 * @param node
 * @returns {Array}
 */
SensorNode.prototype.getSensorsToSubTo = function () {
    var toReturn = [];
    const that = this;
    sensors.forEach(function (s) {

        for (var w = 0; w < that.want.length; w++) {

            if (s.sensors.indexOf(that.want[w]) > 0) {
                toReturn.push(s);
                break;
            }
        }

    });

    return toReturn;
};


SensorNode.prototype.getSensorsToPubTo = function () {
    const that = this;

    sensors.forEach(function (s) {

        for (var i = 0; i < s.want.length; i++) {

            if (that.sensors.indexOf(s.want[i]) > 0) {
                s.socket.write('ct-' + that.getString() + '*');
                break;
            }
        }

    });

};

/**
 * Equality between sensor nodes
 * @param node
 * @returns {boolean}
 */
SensorNode.prototype.equals = function (node) {
    return (this.ip == node.ip) && (this.hostname == node.hostname)
        && (this.sensors == node.sensors) && (this.want == node.want);
}


//start listening for connections
server.listen(9999, '10.20.0.128');







