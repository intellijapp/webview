import React, { Component } from 'react';
import { WebView } from 'react-native-webview';
import { View, ActivityIndicator, Text, Button, BackHandler, Image, StatusBar } from 'react-native';
import NetInfo from "@react-native-community/netinfo";

const website = 'developer.hesbaty.com';

export default class App extends Component {
  state = {
    loading: true,
    error: false,
    isConnected: true,
    isBackOnline: false,
  }

  unsubscribe = null;
  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButton.bind(this));
    this.unsubscribe = NetInfo.addEventListener(state => {
      let isBackOnline = !this.state.isConnected && state.isConnected && state.isInternetReachable;
      this.setState({ isBackOnline: isBackOnline, isConnected: state.isConnected && state.isInternetReachable, });

      if (isBackOnline) setTimeout(() => this.setState({ isBackOnline: false, }), 3000);
    });
    StatusBar.setHidden(true);
  }
  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton.bind(this));
    if (this.unsubscribe)
      this.unsubscribe();
  }

  currentUrl = null;
  handleBackButton = () => {
    if (!this.inHomePage()) this.wv.goBack();
    return true;
  }

  inHomePage = () => {
    let url = this.currentUrl.endsWith('/') ? this.currentUrl.substr(0, url.left - 1) : this.currentUrl;
    return url === 'http://' + website || url == 'https://' + website;
  }

  onShouldStartLoadWithRequest = (navigator) => {
    this.currentUrl = navigator.url.toLowerCase();
    if (this.currentUrl.includes('://' + website) !== true) {
      this.wv.stopLoading();
      return false;
    }
    return true;
  }

  handelError = () => {
    this.wv.reload();
    this.setState({ loading: true, error: false })
  }

  render() {
    return <View style={{ flex: 1, }}>
      <WebView
        source={{ uri: 'http://' + website }}
        ref={wv => this.wv = wv}
        onShouldStartLoadWithRequest={this.onShouldStartLoadWithRequest} //for iOS
        onNavigationStateChange={this.onShouldStartLoadWithRequest} //for Android
        onLoad={() => this.setState({ loading: false, error: false })}
        onError={() => this.setState({ loading: false, error: true })}
      />
      {this.renderLoader()}
      {this.renderError()}
      {
        !this.state.isConnected && <View style={{
          position: 'absolute', top: 0, width: '100%',
          backgroundColor: '#f00', padding: 6,
          alignItems: 'center'
        }}>
          <Text style={{ color: '#fff', }}>No Connection</Text>
        </View>
      }

      {
        this.state.isBackOnline && <View style={{
          position: 'absolute', top: 0, width: '100%',
          backgroundColor: '#0b0', padding: 6,
          alignItems: 'center'
        }}>
          <Text style={{ color: '#fff', }}>You online now</Text>
        </View>
      }
    </View>;
  }

  renderLoader = () => !this.state.loading ? null : <View style={{
    position: 'absolute', top: 0, left: 0, bottom: 0, right: 0,
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)',
  }}>
    <Image source={require('./assets/icon.png')}
      style={{ width: 200, height: 200 }} />
    <ActivityIndicator size="large" />
  </View>;

  renderError = () => !this.state.error ? null : <View style={{
    position: 'absolute', top: 0, left: 0, bottom: 0, right: 0,
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#fff'
  }}>
    <Text style={{ padding: 16, fontWeight: 'bold' }}>Network Error</Text>
    <Button onPress={this.handelError} title='Retry' />
  </View>;
}
