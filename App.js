import React, { Component, Fragment } from 'react';
import { WebView } from 'react-native-webview';
import {
  View,
  ActivityIndicator,
  Text,
  Button,
  BackHandler,
  Image,
  StatusBar,
  TouchableOpacity,
  SafeAreaView
} from 'react-native';
import NetInfo from "@react-native-community/netinfo";

const website = 'hesbaty.com';

export default class App extends Component {
  state = {
    error: false,
    isConnected: true,
    isBackOnline: false,
    showSplashScreen: true,
  }

  unsubscribe = null;
  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
    this.unsubscribe = NetInfo.addEventListener(state => {
      let isBackOnline = !this.state.isConnected && state.isConnected && state.isInternetReachable;
      this.setState({ isBackOnline: isBackOnline, isConnected: state.isConnected && state.isInternetReachable, });

      if (isBackOnline) {
        setTimeout(() => this.setState({ isBackOnline: false, }), 3000);
        if (this.state.error)
          this.wv.reload();
      }
    });
    StatusBar.setHidden(true);
  }
  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
    if (this.unsubscribe)
      this.unsubscribe();
  }

  currentUrl = null;
  handleBackButton = () => {
    if (!this.inHomePage()) this.wv.goBack();
    return true;
  }

  inHomePage = () => {
    if (this.currentUrl)
      return true;
    let url = this.currentUrl.endsWith('/') ? this.currentUrl.substr(0, url.left - 1) : this.currentUrl;
    return url === 'http://' + website || url == 'https://' + website;
  }

  onShouldStartLoadWithRequest = (navigator) => {
    this.currentUrl = navigator.url.toLowerCase();
    if (this.wv && this.currentUrl && this.currentUrl.includes('://' + website) !== true) {
      this.wv.stopLoading();
      return false;
    }
    return true;
  }

  render() {
    return <Fragment>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
        <Navbar />

        <Notify color='#f00' text='No Connection' showIf={!this.state.isConnected} />
        <Notify color='#0b0' text='You online now' showIf={this.state.isBackOnline} />

        <WebView
          source={{ uri: 'http://' + website }}
          ref={wv => this.wv = wv}
          onShouldStartLoadWithRequest={this.onShouldStartLoadWithRequest} //for iOS
          onNavigationStateChange={this.onShouldStartLoadWithRequest} //for Android
          onError={() => this.setState({ error: true })}
          onLoadStart={() => this.setState({ error: false })}
          onLoadEnd={() => this.setState({ showSplashScreen: false })}
          renderLoading={this.loader}
          renderError={this.renderError}
          javaScriptEnabled
          domStorageEnabled
          startInLoadingState
        />
      </SafeAreaView>
    </Fragment>;
  }

  renderError = () => {
    if (this.state.isConnected)
      return <Error onRety={() => this.wv.reload()} showIf={this.state.error} />;
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Image source={require('./assets/noConnection.jpg')} style={{ width: 200, height: 200 }} />
    </View>;
  }
  loader = () => !this.state.showSplashScreen ? <ActivityIndicator size='large' style={{ marginVertical: 100 }} /> :
    <View style={{ height: '80%', justifyContent: 'center', alignItems: 'center', backgroundColor: '#fffb', }}>
      <Image source={require('./assets/icon.png')} style={{ width: 200, height: 200 }} />
      <ActivityIndicator size="large" />
    </View>;
}

const Navbar = () => <View style={{
  height: 60, width: '100%', padding: 10, backgroundColor: '#303641', flexDirection: 'row',
  justifyContent: 'space-between'
}}>
  <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
    <Image source={require('./assets/header.png')} resizeMode='cover'
      style={{ height: 50, width: 150, marginHorizontal: 10 }}
    />
  </View>

  <TouchableOpacity style={{ justifyContent: 'center', alignItems: 'center', padding: 10, backgroundColor: '#fff1', borderRadius: 4 }}
    onPress={BackHandler.exitApp}>
    <Text style={{ color: '#fff', fontSize: 24 }}>▷</Text>
  </TouchableOpacity>
</View>;

const Notify = ({ showIf, color, text, textColor = '#fff' }) => !showIf ? null : <View
  style={{ width: '100%', backgroundColor: color, padding: 6, alignItems: 'center' }}>
  <Text style={{ color: textColor, }}>{text}</Text>
</View>;

const Error = ({ onRety, showIf }) => !showIf ? null : <View style={{
  justifyContent: 'center', alignItems: 'center', backgroundColor: '#fffb'
}}>
  <Text style={{ padding: 16, fontWeight: 'bold' }}>Network Error</Text>
  <Button onPress={onRety} title='Retry' />
</View>;


