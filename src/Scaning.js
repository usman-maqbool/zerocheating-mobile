import { View, Text, Vibration,  TouchableOpacity, BackHandler, Modal, StyleSheet } from 'react-native'
import React, { useState, useEffect } from 'react'
import Container from './Container'
import Logo from './Logo'
import { RNCamera } from 'react-native-camera';
import Button from './Button';
import { theme } from './Theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import DeviceInfo from 'react-native-device-info'; 
import { baseUrl } from './Configuration';
import WarnIcon from 'react-native-vector-icons/AntDesign';

const ScaningView = ({ navigation }) => {
    const [barcodeData, setBarcodeData] = useState('');
    const [verification, setVerification] = useState(false)
    const [deviceName, setDeviceName] = useState('')
    const profileUpdateUrl = `${baseUrl}/accounts/update/profile/`
    const [userToken, setUserToken] = useState('')

    const getMobileName = async () => {
        try {
          const mobileName = await DeviceInfo.getDeviceName();
          setDeviceName(mobileName)
        } catch (error) {
          console.log(error);
        }
      };
      getMobileName();
     
      let hasVibrated = false;
      const vibrateOnce = () => {
        if (!hasVibrated) {
          Vibration.vibrate(100); // Adjust the duration as needed
          hasVibrated = true;
        }
      };
      
      const handleBarcodeRead = (barcode) => {
        setBarcodeData(barcode.data);
        setVerification(true);
      
        // Trigger the vibration once
        vibrateOnce();
      };

    const startVerification = () => {
        AsyncStorage.setItem("qrCode", JSON.stringify(barcodeData))
        .then(() => {
            console.log('Data saved successfully', 'Yes');
            mobileFunction()
            navigation.navigate('Biometric')
        })
    };

    useEffect(() => {
        locaLdata()
    }, [])

    const locaLdata = async () => {
        try {
          const value = await AsyncStorage.getItem("user");
          if (value) {
            const data = JSON.parse(value);
            const token = data.access;
            setUserToken(token);
        } else {
            console.log("Value not found in local storage");
          }
        } catch (error) {
          console.log("Error retrieving data:", error);
        }
      };

    const mobileFunction = () => {
        const headers = {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          };
          const data = {
            mobile_name: deviceName,
          };
          axios
            .post(profileUpdateUrl, data, { headers })
            .then((response) => {
              console.log(response)
              navigate("/qrcode");
            })
            .catch((error) => {
              console.log(error);
            });
    }
    const [backModal, setBackModal] = useState(false)

    const handleModalClose = () => {
        setBackModal(false)
    }
    const handleLogout = () => {
        setBackModal(false)
        AsyncStorage.removeItem('qrCode');
        AsyncStorage.removeItem('user');
        console.log('Data removed successfully');
        setBackModal(false)
        navigation.navigate("Registration")
    }
    useEffect(() => {
        const backAction = () => {
            
            setBackModal(true)
          return true;
        };
        BackHandler.addEventListener('hardwareBackPress', backAction);
        return () => {
          BackHandler.removeEventListener('hardwareBackPress', backAction);
        };
      }, []);

    return (
        <Container>
                <Logo />
            <View>
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={backModal}
                >
                    <View style={styles.centeredView}>
                        <View style={styles.modalView}>
                            <View style={{  justifyContent: 'center', alignItems: 'center' }}>
                                <Text style={{ fontSize: 100, color: 'red' }}><WarnIcon name="warning" size={80} color='red' /></Text>
                            </View>
                                <View style={{marginTop:30}}>

                                    <Text style={styles.modalText}>Once the verification process has been initiated, it is not possible to go back. You have the option to click “Cancel” to restart the process or click “Proceed” to advance to the next step.</Text>
                                </View>
                                <View style={{ flexDirection: 'row', marginTop:20, justifyContent: 'space-between' }}>

                                    <Button mode="contained" style={[
                                        styles.buttonModal, {backgroundColor:theme.colors.secondary}
                                    ]}
                                        
                                        onPress={handleLogout}
                                    >
                                     <Text>
                                        Cancel
                                     </Text>
                                    </Button>
                                    <Button mode="contained" style={[
                                        styles.buttonModal,
                                    ]}
                                    onPress={handleModalClose}
                                    >
                                    
                                    Proceed
                                    </Button>
                                </View>
                        </View>
                    </View>
                </Modal>
            </View>
            { !backModal ? 
            <>
            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                <RNCamera
                    style={{ width: 300, marginTop: 50, justifyContent: 'center', height: 250 }}
                    onBarCodeRead={handleBarcodeRead}
                />
            </View>
            {barcodeData ? 
                <View style={styles.barCodeView}>
                    <Text style={{textAlign:'center', color:'black'}}>{barcodeData}</Text>
                </View> : null
        }
            <View style={styles.textView}>
                <Text style={styles.text}>
                    Scan the QR code shown
                    on the screen
                </Text>
                {!verification ?
                    <Button mode="contained" disabled={verification} style={[
                        styles.button,
                        { backgroundColor: theme.colors.secondary }
                    ]}>
                        Waiting...
                    </Button>
                    :
                    <Button mode="contained" style={[
                        styles.button,
                    ]} onPress={startVerification}>
                        Verify QR
                    </Button>
                }
            </View>
            </>
        : null }
        </Container>
    )
}

const styles = StyleSheet.create({
    textView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 80,
        width: '100%',
        // marginLeft: 20
    },
    text: {
        textAlign: 'center',
        color: '#202020',
        fontWeight: '500',
        fontSize: 18,
        marginVertical: 10,
    },
    waitingView: {
        backgroundColor: 'red'
    },

    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22,
        height: 220
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        height:450,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    button: {
        borderRadius: 20,
        width:'80%'
    },
    buttonModal: {
        borderRadius: 20,
        width:120
    },
    textStyle: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    modalText: {
        marginBottom: 15,
        textAlign: 'left',
        color: "black",
        fontWeight: '500',
        fontSize: 18,

    },
    barCodeView:{
        justifyContent:'center',
        alignItems:'center',
        backgroundColor:"#E9ECEF", 
        // width:290,
        height:50,
        // marginLeft:15,
        borderRadius:10,
    }
})


export default ScaningView

