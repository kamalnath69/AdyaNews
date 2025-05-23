import React from "react";
import ReactDOM from "react-dom";
import { HashRouter } from "react-router-dom";  
import { Provider } from "react-redux";
import store from "./redux/store";
import App from "./App";
import "./index.css";

ReactDOM.render(
    <Provider store={store}>
        <HashRouter>  
            <App />
        </HashRouter>
    </Provider>,
    document.getElementById("root")
);
