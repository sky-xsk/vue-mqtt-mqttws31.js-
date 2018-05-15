//引入axios
import axios from 'axios'
import qs from 'qs'
axios.defaults.timeout = 5000;
//判断环境
//配置默认地址
var baseURL = axios.defaults.baseURL = '';
if (process.env.NODE_ENV === 'production') {
    baseURL = ''
} else {
    baseURL = 'http://192.168.1.146:8090'
}
//axios.defaults.headers.common['Authorization'] = `token ${TOKEN}`
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded'
axios.defaults.params = {}

//新增配置
// axios.interceptors.request.use(
//     requestConfig => {
//         if (store.state.token) {
//             config.headers.Authorization = `${store.state.token}`;
//         }
//         return requestConfig;
//     }, err => {
//         return Promise.reject(err);
//     });

// axios.interceptors.response.use(response => {
//     return response;
// }, error => {
//     if (error.response) {
//         switch (error.response.status) {
//             case 401:
//                 /* 返回 401 表示前端的token已失效 当然，你也可以和后端也定其他的方式来表示token失效 需要前端清除Vuex中的token，页面跳转到登陆页 */
//                 store.commit(types.LOGOUT);
//                 router.replace({
//                     path: 'login',
//                     query: {
//                         redirect: router.currentRoute.fullPath
//                     }
//                 })
//         }
//     }
//     return Promise.reject(error.response.data)
// });


// POST传参序列化
axios.interceptors.request.use((config) => {
    return config
}, (error) => {
    return Promise.reject(error)
})

// http请求拦截器
axios.interceptors.request.use(config => {
    return config
}, error => {
    return Promise.reject(error)
})

// 响应成功关闭
axios.interceptors.response.use(data => {
    return data
}, error => {
    return Promise.reject(error)
})

//promise封装获取数据
export const oGet = (url, params) => {
    return new Promise((resolve, reject) => {
        axios.get(url, params)
            .then(res => {
                resolve(res.data)
            }, err => {
                reject(err)
            })
            .catch(err => {
                reject(err)
            })
    })
};

//promise封装发送数据
export const oPost = (url, params) => {
    return new Promise((resolve, reject) => {
        axios.post(url, params)
            .then(res => {
                resolve(res.data)
            }, err => {
                reject(err)
            })
            .catch(err => {
                reject(err)
            })
    })
};
//promise封装更新数据,传的参数不同
export const oUpdate = (url, param, params) => {
    return new Promise((resolve, reject) => {
        axios.patch(url, param, params)
            .then(res => {
                resolve(res.data)
            }, err => {
                reject(err)
            }).catch(err => {
                reject(err)
            })
    })
};
//传的参数标准
export const oUpdates = (url, params) => {
        return new Promise((resolve, reject) => {
            axios.patch(url, params)
                .then(res => {
                    resolve(res.data)
                }, err => {
                    reject(err)
                }).catch(err => {
                    reject(err)
                })
        })
    }
    //promise封装删除数据
export const oRemove = (url, params) => {
    return new Promise((resolve, reject) => {
        axios.delete(url, params)
            .then(res => {
                resolve(res.data)
            }, err => {
                reject(err)
            }).catch(err => {
                reject(err)
            })
    })
};

export default {

};