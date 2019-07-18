import React, { Component } from 'react';
import { WebView } from 'react-native-webview';
import { View, ActivityIndicator, Text, Button, BackHandler, Image } from 'react-native';


export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      error: false,
    }
  }

  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButton.bind(this));
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton.bind(this));
  }

  currentUrl = null;
  handleBackButton() {
    let url = this.currentUrl;
    let homePageUrl =
      url === 'http://developer.hesbaty.com/' ||
      url === 'http://developer.hesbaty.com' ||
      url === 'https://developer.hesbaty.com/' ||
      url === 'https://developer.hesbaty.com';

    if (!homePageUrl)
      this.wv.goBack();
    return true;
  }

  onShouldStartLoadWithRequest(navigator) {
    this.currentUrl = navigator.url.toLowerCase();
    if (navigator.url.toLowerCase().includes('developer.hesbaty.com') !== true) {
      this.wv.stopLoading();
      return false;
    }
    return true;
  }

  handelError() {
    this.wv.reload();
    this.setState({ loading:true, error:false})
  }

  render() {
    return (<View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'stretch' }}>
      <WebView
        source={{ uri: 'http://developer.hesbaty.com' }}
        ref={wv => this.wv = wv}
        onShouldStartLoadWithRequest={this.onShouldStartLoadWithRequest} //for iOS
        onNavigationStateChange={this.onShouldStartLoadWithRequest} //for Android
        onLoad={() => this.setState({ loading: false, error:false })}
        onError={()=>this.setState({loading:false, error:true})}
      />
      {
        this.state.loading &&
        <View style={{
          position: 'absolute', top: 0, left: 0, bottom: 0, right: 0,
          flex: 1, justifyContent: 'center', alignItems: 'center',
          backgroundColor: 'rgba(255,255,255,0.8)',
        }}>
          <Image source={require('./assets/icon.png')}
            style={{ width: 200, height: 200 }} />
          <ActivityIndicator size="large" />
        </View>
      }
      {
        this.state.error && 
        <View style={{ 
          position: 'absolute', top: 0, left: 0, bottom: 0, right: 0,
          flex: 1, justifyContent: 'center', alignItems: 'center',
          backgroundColor:'#fff'
        }}>
          <Text style={{padding:16, fontWeight:'bold'}}>Network Error</Text>
          <Button onPress={this.handelError.bind(this)} title='Retry' />
        </View>
      }
    </View>);
  }
}
