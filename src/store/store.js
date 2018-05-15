import Vue from 'vue'
import Vuex from 'vuex'
import logins from './modules/logins.js'
Vue.use(Vuex)

//状态对象
const state = { //设置值

};
const mutations = { //触发


};
const getters = { //设置值

};
const actions = { //异步触发

};

export default new Vuex.Store({
    state,
    mutations,
    getters,
    actions,
    modules: {
        logins,
    },
})