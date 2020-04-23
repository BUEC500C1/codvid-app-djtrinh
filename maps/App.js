import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Button,
  PermissionsAndroid,
  Alert,
  ScrollView,
} from 'react-native';
import MapView from 'react-native-maps';
import DialogInput from 'react-native-dialog-input';
import Geolocation from '@react-native-community/geolocation';
import Dialog, {
  DialogContent,
  DialogButton,
  DialogFooter,
} from 'react-native-popup-dialog';
import DatePicker from 'react-native-datepicker';

console.disableYellowBox = true;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  container2: {
    flex: 1,
    flexDirection: 'row',
  },
  box: {
    flex: 1,
    alignItems: 'center',
  },
  box1: {
    flex: 10,
  },
  box2: {
    flex: 3,
  },
  box3: {
    flex: 1,
  },
  box4: {
    flex: 1,
    marginTop: 20,
  },
});

// Android permission request section
const requestLocationPermission = async () => {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Covid App Permission',
        message: 'Covid App needs access to your location ',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log('You can use the location');
    } else {
      console.log('Camera permission denied');
    }
  } catch (err) {
    console.warn(err);
  }
};

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      Confirmed: 0,
      Deaths: 0,
      Active: 0,
      Recovered: 0,
      countryConfirmed: 0,
      countryDeaths: 0,
      countryActive: 0,
      countryRecovered: 0,
      subDivision: '',
      locality: '',
      countryCode: '',
      countryName: '',
      date: '',
      loading: true,
      region: {
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      },
      visible: false,
      isMapReady: false,
      marginTop: 1,
      userLocation: '',
      regionChangeProgress: false,
      isDialogVisible: false,
    };

    requestLocationPermission();
  }

  // find State based off reverse geocoding
  fetchState = () => {
    this.setState({
      fromFetch: true,
      loading: true,
    });
    fetch(
      'https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=' +
        this.state.region.latitude +
        '&longitude=' +
        this.state.region.longitude +
        '&localityLanguage=en',
    )
      .then(response => response.json())
      .then(responseJson => {
        this.setState({
          subDivision: responseJson.principalSubdivision,
          locality: responseJson.locality,
          countryCode: responseJson.countryCode,
          countryName: responseJson.countryName,
        });
      })
      .catch(error => console.log(error));
  };

  // grab COVID live data by state
  fetchCovidData = () => {
    this.setState({
      fromFetch: true,
      loading: true,
    });
    fetch(
      'https://api.covid19api.com/live/country/' +
        this.state.countryCode +
        '/status/confirmed',
    )
      .then(response => response.json())
      .then(responseJson => {
        let foundProvince = false;
        for (let i = 0; i < responseJson.length; i++) {
          if (
            // if country has no province we grab the latest result
            responseJson[i].Province === this.state.subDivision ||
            (!foundProvince && i === responseJson.length - 1)
          ) {
            foundProvince = true;
            this.setState({
              Deaths: responseJson[i].Deaths,
              Recovered: responseJson[i].Recovered,
              Active: responseJson[i].Active,
              Confirmed: responseJson[i].Confirmed,
            });
          }
        }
      })
      .catch(error => console.log(error));
  };

  // grab COVID live data by state
  fetchCovidCountry = () => {
    this.setState({
      fromFetch: true,
      loading: true,
    });
    fetch('https://api.covid19api.com/total/country/' + this.state.countryCode)
      .then(response => response.json())
      .then(responseJson => {
        this.setState({
          countryDeaths: responseJson[responseJson.length - 1].Deaths,
          countryRecovered: responseJson[responseJson.length - 1].Recovered,
          countryActive: responseJson[responseJson.length - 1].Active,
          countryConfirmed: responseJson[responseJson.length - 1].Confirmed,
        });
      })
      .catch(error => console.log(error));
  };

  // grab COVID data world summary
  getWorldCovid = () => {
    fetch('https://api.covid19api.com/world/total')
      .then(response => response.json())
      .then(responseJson => {
        Alert.alert(
          'World Covid Info',
          'TotalConfirmed: ' +
            responseJson.TotalConfirmed +
            '\n' +
            'TotalDeaths: ' +
            responseJson.TotalDeaths +
            '\n' +
            'TotalRecovered: ' +
            responseJson.TotalRecovered +
            '\n',
        );
      })
      .catch(error => console.log(error));
  };

  getCovidCountryDate = () => {
    this.setState({visible: false});

    fetch('https://api.covid19api.com/total/country/' + this.state.countryCode)
      .then(response => response.json())
      .then(responseJson => {
        let dateSplit = this.state.date.split('-');
        dateSplit = dateSplit[2]+'-'+dateSplit[0]+'-'+dateSplit[1];
        for (let i = 0; i < responseJson.length; i++) {
          if (responseJson[i].Date.split('T')[0] === dateSplit) {
            Alert.alert(
              'Country Covid Info',
                'Country: '+
                responseJson[i].Country +
                '\n' +
              'TotalConfirmed: ' +
                responseJson[i].Confirmed +
                '\n' +
                'TotalDeaths: ' +
                responseJson[i].Deaths +
                '\n' +
                'TotalRecovered: ' +
                responseJson[i].Recovered +
                '\n' +
                'Date: '+
                responseJson[i].Date +
                '\n',
            );
            return;
          }
        }
        Alert.alert('Invalid Date', 'Covid info ' + 'invalid at date');
      })
      .catch(error => console.log(error));
  };

  // Update state on region change
  onRegionChange = region => {
    this.setState({
      region,
      regionChangeProgress: true,
    });
    this.refreshInfo();
  };

  // Action to be taken after select location button click
  refreshInfo = () => {
    this.fetchState();
    this.fetchCovidData();
    this.fetchCovidCountry();
  };

  // Show dialog when button pressed
  goToAddress = () => {
    this.setState({isDialogVisible: true});
  };

  // convert address to lat long and update mapview
  sendInput = input => {
    let cleanAddress = input.replace(',', '');
    cleanAddress = cleanAddress.split(' ').join('+');
    //alert(cleanAddress);
    let url =
      'https://api.geocod.io/v1.4/geocode?q=' +
      cleanAddress +
      '&api_key=YOUR_KEY_HERE';
    fetch(url)
      .then(response => response.json())
      .then(responseJson => {
        let r = {
          latitude: responseJson.results[0].location.lat,
          longitude: responseJson.results[0].location.lng,
          latitudeDelta: 0.5,
          longitudeDelta: 0.5,
        };
        this._map.animateToRegion(r, 2000);
      })
      .catch(error => console.log(error));
    this.setState({isDialogVisible: false});
  };

  componentWillMount() {
    Geolocation.getCurrentPosition(
      position => {
        const region = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        };
        this.setState({
          region: region,
          loading: false,
          error: null,
        });
      },
      error => {
        alert(error);
        this.setState({
          error: error.message,
          loading: false,
        });
      },
      {enableHighAccuracy: false, timeout: 200000, maximumAge: 5000},
    );
  }

  onMapReady = () => {
    this.setState({isMapReady: true, marginTop: 0});
  };

  getCountryDate = () => {
    this.setState({visible: true});
  };

  render() {
    return (
      <View style={styles.container}>
        <MapView.Animated
          ref={component => (this._map = component)}
          style={{...styles.box1, marginTop: this.state.marginTop}}
          initialRegion={this.state.region}
          showsUserLocation={true}
          onMapReady={this.onMapReady}
          onRegionChangeComplete={this.onRegionChange}
        />

        <DialogInput
          isDialogVisible={this.state.isDialogVisible}
          title={'Go to address'}
          message={'Address:'}
          hintInput={'555 Pretend St, Boston MA 02446'}
          submitInput={inputText => {
            this.sendInput(inputText);
          }}
          closeDialog={() => {
            this.setState({isDialogVisible: false});
          }}
        />

        <Dialog
          visible={this.state.visible}
          onTouchOutside={() => {
            this.setState({visible: false});
          }}
          footer={
            <DialogFooter>
              <DialogButton
                text="CANCEL"
                onPress={() => {
                  this.setState({visible: false});
                }}
              />
              <DialogButton
                text="OK"
                onPress={() => {
                  this.getCovidCountryDate();
                }}
              />
            </DialogFooter>
          }>
          <DialogContent>
            {
              <DatePicker
                style={{width: 200}}
                date={this.state.date} //initial date from state
                mode="date" //The enum of date, datetime and time
                placeholder="select date"
                format="MM-DD-YYYY"
                minDate="01-01-2020"
                maxDate="01-01-3000"
                confirmBtnText="Confirm"
                cancelBtnText="Cancel"
                customStyles={{
                  dateIcon: {
                    position: 'absolute',
                    left: 0,
                    top: 4,
                    marginLeft: 0,
                    marginTop: 15,
                  },
                  dateInput: {
                    marginLeft: 36,
                    marginTop: 30,
                  },
                }}
                onDateChange={date => {
                  this.setState({date: date});
                }}
              />
            }
          </DialogContent>
        </Dialog>

        <Dialog
          isDialogVisible={this.state.isDialogVisible}
          title={'Go to address'}
          message={'Address:'}
          hintInput={'555 Pretend St, Boston MA 02446'}
          submitInput={inputText => {
            this.sendInput(inputText);
          }}
          closeDialog={() => {
            this.setState({isDialogVisible: false});
          }}
        />
        <View style={[styles.box, styles.box2]}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: 'bold',
              fontFamily: 'roboto',
              marginBottom: 10,
            }}>
            Move map for location
          </Text>
          <ScrollView style={styles.scrollView}>
            <Text
              onPress={this.refreshInfo}
              style={{fontSize: 16, color: '#999'}}>
              LOCATION: {this.state.subDivision}
            </Text>
            <Text
              onPress={this.refreshInfo}
              style={{fontSize: 16, color: '#999'}}>
              Confirmed: {this.state.Confirmed}
            </Text>
            <Text
              onPress={this.refreshInfo}
              style={{fontSize: 16, color: '#999'}}>
              Deaths: {this.state.Deaths}
            </Text>
            <Text
              onPress={this.refreshInfo}
              style={{fontSize: 16, color: '#999'}}>
              Recovered: {this.state.Recovered}
            </Text>
            <Text
              onPress={this.refreshInfo}
              style={{fontSize: 16, color: '#999'}}>
              Active: {this.state.Active}
            </Text>
            <Text
              onPress={this.refreshInfo}
              style={{fontSize: 16, color: '#999'}}>
              {'\n'}Country: {this.state.countryName}
            </Text>
            <Text
              onPress={this.refreshInfo}
              style={{fontSize: 16, color: '#999'}}>
              Confirmed: {this.state.countryConfirmed}
            </Text>
            <Text
              onPress={this.refreshInfo}
              style={{fontSize: 16, color: '#999'}}>
              Deaths: {this.state.countryDeaths}
            </Text>
            <Text
              onPress={this.refreshInfo}
              style={{fontSize: 16, color: '#999'}}>
              Recovered: {this.state.countryRecovered}
            </Text>
            <Text
              onPress={this.refreshInfo}
              style={{fontSize: 16, color: '#999'}}>
              Active: {this.state.countryActive}
            </Text>
          </ScrollView>
        </View>
        <View style={styles.container2}>
          <View style={[styles.box, styles.box3]}>
            <View style={styles.btnContainer}>
              <Button title="REFRESH LIVE INFO" onPress={this.refreshInfo} />
            </View>
          </View>
          <View style={[styles.box, styles.box3]}>
            <View style={styles.btnContainer}>
              <Button
                title="GET WORLD SUMMARY INFO"
                onPress={this.getWorldCovid}
              />
            </View>
          </View>
          <View style={[styles.box, styles.box3]}>
            <View style={styles.btnContainer}>
              <Button
                title="GET COUNTRY BY DATE"
                onPress={this.getCountryDate}
              />
            </View>
          </View>
        </View>
        <View style={[styles.box, styles.box4]}>
          <View style={styles.btnContainer}>
            <Button title="Enter Address" onPress={this.goToAddress} />
          </View>
        </View>
      </View>
    );
  }
}
