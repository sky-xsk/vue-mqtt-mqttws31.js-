<template>
    <div>
        <h1 style='text-align:center'>MQTT演示demo</h1>
        <h2 style="color: green">此处的数据，用于演示增删改：<i>{{example}}</i></h2>
        <h3>此处显示接收的历史数据: <p style='color:red' v-for="item in list" :key="item">{{item}}</p></h3>
    </div>
</template>
<script>
    export default {
        data() {
            return {
                reconnectTimeout: 2000,
                mqtt: {},
                msg:"",
                list: [],
                example: '',
            }
        },
        mounted() {
            this.MQTTconnect();
        },
        methods: {
            //实时数据变化
            addTopic(msg) {
              this.msg = msg;
              this.list.push(msg);
              this.example = msg;
            },

            updateTopic(msg){
              this.example = msg;
            },

            removeTopic(msg) {
              this.example = '';
            },

            //实时通信
            MQTTconnect() {
                this.mqtt = new Paho.MQTT.Client(
                    host,
                    port,
                    "client" + this.getuuid(),  //防止多个浏览器打开，导致的问题，保证唯一性
                );
                var options = {
                     // 如果连接在此秒数内未成功，则视为已失败
                    timeout: 10,
                     // 如果存在且为true，则使用SSL Websocket连接
                    useSSL: useTLS,
                     // 如果此秒数内没有活动，服务器将断开此客户端的连接
                    keepAliveInterval: 60,
                    //session 标志位，当 clean session = false 时，
                    //client 失去连接时， broker 会一直保留消息直到 client 重新连接。
                    // 而 clean session = true 时，broker 会清除所有的消息当这个 client 失去连接。
                    cleanSession: cleansession,
                    onSuccess: this.onConnect,
                    onFailure: function(message) {
                        //连接失败定时重连
                        setTimeout(this.MQTTconnect, this.reconnectTimeout);
                    }
                };
                this.mqtt.onConnectionLost = this.onConnectionLost;
                this.mqtt.onMessageArrived = this.onMessageArrived;
                if (username != null) {
                    options.userName = username;
                    options.password = password;
                }
                this.mqtt.connect(options);
            },
            //uuid随机生成
            getuuid() {
                var uid = [];
                var hexDigits = "0123456789abcdefghijklmnopqrst";
                for (var i = 0; i < 32; i++) {
                    uid[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
                }
                uid[6] = "4";
                uid[15] = hexDigits.substr((uid[15] & 0x3) | 0x8, 1);
                var uuid = uid.join("");
                return uuid;
            },
            //连接
            onConnect() {
                 // QoS0，最多一次送达。也就是发出去就fire掉，没有后面的事情了。
                 // QoS1，至少一次送达。发出去之后必须等待ack，没有ack，就要找时机重发
                 // QoS2，准确一次送达。消息id将拥有一个简单的生命周期。
                //连接成功，订阅主题
                this.mqtt.subscribe(addtopic, {
                    qos: 2
                });

                this.mqtt.subscribe(updatetopic, {
                    qos: 2
                });

                this.mqtt.subscribe(removetopic, {
                    qos: 2
                });
               
                //发布一个消息 
                this.mqtt.send("login", "{\"command\":\"login\",\"clientId\":\"" + this.mqtt.clientId + "\"}", 0);
                // const login = {
                //    "command":"login",
                //    "clientId": this.mqtt.clientId,
                // }
                // this.mqtt.send("login",JSON.stringify(login), 2);
            },
            //连接丢失
            onConnectionLost(response) {
                console.log("异常掉线，掉线信息为:" + response.errorMessage);
            },
    
            //接收到消息，处理
            onMessageArrived(message) {
                //  if (message.retained) {
                //       return;
                //   }
                // RETAIN： 发布保留标识，表示服务器要保留这次推送的信息，如果有新的订阅者出现，
                // 就把这消息推送给它，如果设有那么推送至当前订阅者后释放
                var topics = message.destinationName;
                var msg = message.payloadString;
                //判断主题
                if (topics === "add") {
                    //添加,此处同时可对数据进行增删改查，等相关数据操作
                    this.addTopic(msg);
                }else if(topics === "update") {
                    this.updateTopic(msg);
                } else if(topics === 'remove') {
                    this.removeTopic(msg)
                } else {
                    return;
                }
            },
        },
    }
</script>

