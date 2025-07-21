import { useState, useEffect } from 'react';
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  TouchableOpacity,
} from 'react-native';
import {
  initPosSdk,
  getPrinter,
  initPrinter,
  addSingleText,
  addQrCode,
  addBarCode,
  startPrinting,
  setGrayLevel,
  getVersionInfo,
  getDeviceSn,
  getPrinterMileage,
  clearPrinterMileage,
  PRINT_ALIGN_STYLE_CENTER,
  PRINT_ALIGN_STYLE_LEFT,
  PRINT_ALIGN_STYLE_RIGHT,
  BARCODE_TYPE_BARCODE_128,
  type Printer,
  type VersionInfo,
} from 'react-native-pos';

export default function App() {
  const [initStatus, setInitStatus] = useState<string>('');
  const [printerStatus, setPrinterStatus] = useState<Printer | null>(null);
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null);
  const [deviceSn, setDeviceSn] = useState<string>('');
  const [printerMileage, setPrinterMileage] = useState<number>(0);
  const [printerError, setPrinterError] = useState<string>('');
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [customText, setCustomText] = useState<string>('Hello from POS!');
  const [grayLevel, setGrayLevelState] = useState<number>(3);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    // Auto-initialize on app start
    handleInitSdk();
  }, []);

  const handleInitSdk = async () => {
    setInitStatus('Initializing...');
    setIsLoading(true);

    try {
      await initPosSdk();
      setInitStatus('✅ POS SDK initialized successfully.');
      setIsInitialized(true);

      // Get initial device information
      await loadDeviceInfo();
    } catch (error) {
      setInitStatus(`❌ Failed to initialize POS SDK: ${error}`);
      setIsInitialized(false);
    } finally {
      setIsLoading(false);
    }
  };

  const loadDeviceInfo = async () => {
    try {
      // Get version info
      const version = getVersionInfo();
      setVersionInfo(version);

      // Get device serial number
      const sn = getDeviceSn();
      setDeviceSn(sn || 'N/A');

      // Get printer mileage
      const mileage = getPrinterMileage();
      setPrinterMileage(mileage);

      // Get printer status
      handleGetPrinterStatus();
    } catch (error) {
      console.error('Error loading device info:', error);
    }
  };

  const handleGetPrinterStatus = () => {
    setPrinterError('');
    try {
      const result = getPrinter();
      if (result && typeof result === 'object') {
        setPrinterStatus(result);
      } else {
        setPrinterStatus(null);
        setPrinterError('⚠️ No printer status returned.');
      }
    } catch (error) {
      setPrinterStatus(null);
      setPrinterError(`❌ Error: ${(error as Error).message}`);
    }
  };

  const handlePrintCustomText = async () => {
    if (!isInitialized) {
      Alert.alert('Error', 'SDK not initialized');
      return;
    }

    try {
      setIsLoading(true);

      await initPrinter();
      await setGrayLevel(grayLevel);

      await addSingleText({
        text: `${customText}\n\n`,
        align: PRINT_ALIGN_STYLE_CENTER,
        fontSize: 24,
        isBold: true,
      });

      await addSingleText({
        text: `Printed at: ${new Date().toLocaleString()}\n\n`,
        align: PRINT_ALIGN_STYLE_LEFT,
        fontSize: 18,
      });

      await startPrinting();
      Alert.alert('Success', 'Text printed successfully!');

      // Refresh printer status after printing
      handleGetPrinterStatus();
      const mileage = getPrinterMileage();
      setPrinterMileage(mileage);
    } catch (error) {
      Alert.alert('Error', `Failed to print: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrintSampleReceipt = async () => {
    if (!isInitialized) {
      Alert.alert('Error', 'SDK not initialized');
      return;
    }

    try {
      setIsLoading(true);

      await initPrinter();
      await setGrayLevel(grayLevel);

      // Header
      await addSingleText({
        text: 'DEMO STORE\n',
        align: PRINT_ALIGN_STYLE_CENTER,
        fontSize: 28,
        isBold: true,
      });

      await addSingleText({
        text: '123 Demo Street\n',
        align: PRINT_ALIGN_STYLE_CENTER,
        fontSize: 20,
      });

      await addSingleText({
        text: 'Tel: (555) 123-4567\n\n',
        align: PRINT_ALIGN_STYLE_CENTER,
        fontSize: 20,
      });

      // Receipt info
      await addSingleText({
        text: `Receipt #: ${Math.floor(Math.random() * 10000)}\n`,
        align: PRINT_ALIGN_STYLE_LEFT,
        fontSize: 20,
      });

      await addSingleText({
        text: `Date: ${new Date().toLocaleDateString()}\n`,
        align: PRINT_ALIGN_STYLE_LEFT,
        fontSize: 20,
      });

      await addSingleText({
        text: `Time: ${new Date().toLocaleTimeString()}\n\n`,
        align: PRINT_ALIGN_STYLE_LEFT,
        fontSize: 20,
      });

      // Items
      await addSingleText({
        text: 'ITEMS:\n',
        align: PRINT_ALIGN_STYLE_LEFT,
        fontSize: 20,
        isBold: true,
      });

      await addSingleText({
        text: '--------------------------------\n',
        align: PRINT_ALIGN_STYLE_LEFT,
        fontSize: 18,
      });

      await addSingleText({
        text: 'Demo Item 1          $10.00\n',
        align: PRINT_ALIGN_STYLE_LEFT,
        fontSize: 18,
      });

      await addSingleText({
        text: 'Demo Item 2          $15.50\n',
        align: PRINT_ALIGN_STYLE_LEFT,
        fontSize: 18,
      });

      await addSingleText({
        text: '--------------------------------\n',
        align: PRINT_ALIGN_STYLE_LEFT,
        fontSize: 18,
      });

      await addSingleText({
        text: 'TOTAL:               $25.50\n\n',
        align: PRINT_ALIGN_STYLE_LEFT,
        fontSize: 20,
        isBold: true,
      });

      // QR Code
      await addQrCode({
        width: 120,
        height: 120,
        data: `receipt_${Date.now()}`,
      });

      await addSingleText({
        text: '\nScan for digital receipt\n\n',
        align: PRINT_ALIGN_STYLE_CENTER,
        fontSize: 16,
      });

      await addSingleText({
        text: 'Thank you for your business!\n\n',
        align: PRINT_ALIGN_STYLE_CENTER,
        fontSize: 20,
      });

      await startPrinting();
      Alert.alert('Success', 'Receipt printed successfully!');

      // Refresh status
      handleGetPrinterStatus();
      const mileage = getPrinterMileage();
      setPrinterMileage(mileage);
    } catch (error) {
      Alert.alert('Error', `Failed to print receipt: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrintBarcode = async () => {
    if (!isInitialized) {
      Alert.alert('Error', 'SDK not initialized');
      return;
    }

    try {
      setIsLoading(true);

      await initPrinter();

      await addSingleText({
        text: 'BARCODE DEMO\n\n',
        align: PRINT_ALIGN_STYLE_CENTER,
        fontSize: 24,
        isBold: true,
      });

      await addBarCode({
        type: BARCODE_TYPE_BARCODE_128,
        width: 300,
        height: 60,
        data: '1234567890123',
      });

      await addSingleText({
        text: '\n1234567890123\n\n',
        align: PRINT_ALIGN_STYLE_CENTER,
        fontSize: 16,
      });

      await startPrinting();
      Alert.alert('Success', 'Barcode printed successfully!');

      // Refresh status
      handleGetPrinterStatus();
      const mileage = getPrinterMileage();
      setPrinterMileage(mileage);
    } catch (error) {
      Alert.alert('Error', `Failed to print barcode: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearMileage = async () => {
    try {
      await clearPrinterMileage();
      const mileage = getPrinterMileage();
      setPrinterMileage(mileage);
      Alert.alert('Success', 'Printer mileage cleared');
    } catch (error) {
      Alert.alert('Error', `Failed to clear mileage: ${error}`);
    }
  };

  const adjustGrayLevel = async (delta: number) => {
    const newLevel = Math.max(1, Math.min(5, grayLevel + delta));
    setGrayLevelState(newLevel);

    if (isInitialized) {
      try {
        await setGrayLevel(newLevel);
        Alert.alert('Success', `Gray level set to ${newLevel}`);
      } catch (error) {
        Alert.alert('Error', `Failed to set gray level: ${error}`);
      }
    }
  };

  const renderStatusSection = (title: string, data: any, error?: string) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <ScrollView style={styles.output}>
          {data ? (
            typeof data === 'object' ? (
              Object.entries(data).map(([key, value]) => (
                <View key={key} style={styles.row}>
                  <Text style={styles.key}>{key}:</Text>
                  <Text style={styles.value}>{String(value)}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.value}>{String(data)}</Text>
            )
          ) : (
            <Text style={styles.text}>No data available</Text>
          )}
        </ScrollView>
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>POS SDK Demo</Text>

      {/* SDK Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>SDK Status</Text>
        <Text
          style={[
            styles.statusText,
            { color: isInitialized ? 'green' : 'red' },
          ]}
        >
          {isInitialized ? 'Initialized' : 'Not Initialized'}
        </Text>
        <Text style={styles.text}>{initStatus}</Text>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, isLoading && styles.disabledButton]}
            onPress={handleInitSdk}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Initializing...' : 'Initialize SDK'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              (!isInitialized || isLoading) && styles.disabledButton,
            ]}
            onPress={handleGetPrinterStatus}
            disabled={!isInitialized || isLoading}
          >
            <Text style={styles.buttonText}>Refresh Status</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Device Information */}
      {renderStatusSection('Device Serial Number', deviceSn)}
      {renderStatusSection('Version Information', versionInfo)}
      {renderStatusSection('Printer Status', printerStatus, printerError)}

      {/* Printer Mileage */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Printer Mileage</Text>
        <Text style={styles.text}>Total: {printerMileage.toFixed(2)} mm</Text>
        <TouchableOpacity
          style={[
            styles.button,
            (!isInitialized || isLoading) && styles.disabledButton,
          ]}
          onPress={handleClearMileage}
          disabled={!isInitialized || isLoading}
        >
          <Text style={styles.buttonText}>Clear Mileage</Text>
        </TouchableOpacity>
      </View>

      {/* Print Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Print Settings</Text>
        <View style={styles.settingRow}>
          <Text style={styles.text}>Gray Level: {grayLevel}</Text>
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={styles.smallButton}
              onPress={() => adjustGrayLevel(-1)}
              disabled={grayLevel <= 1}
            >
              <Text style={styles.buttonText}>-</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.smallButton}
              onPress={() => adjustGrayLevel(1)}
              disabled={grayLevel >= 5}
            >
              <Text style={styles.buttonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Custom Text Printing */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Custom Text Print</Text>
        <TextInput
          style={styles.textInput}
          value={customText}
          onChangeText={setCustomText}
          placeholder="Enter text to print"
          multiline
          editable={!isLoading}
        />
        <TouchableOpacity
          style={[
            styles.button,
            (!isInitialized || isLoading) && styles.disabledButton,
          ]}
          onPress={handlePrintCustomText}
          disabled={!isInitialized || isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Printing...' : 'Print Custom Text'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Demo Prints */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Demo Prints</Text>

        <TouchableOpacity
          style={[
            styles.button,
            (!isInitialized || isLoading) && styles.disabledButton,
          ]}
          onPress={handlePrintSampleReceipt}
          disabled={!isInitialized || isLoading}
        >
          <Text style={styles.buttonText}>Print Sample Receipt</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            (!isInitialized || isLoading) && styles.disabledButton,
            {
              marginBottom: 180,
            },
          ]}
          onPress={handlePrintBarcode}
          disabled={!isInitialized || isLoading}
        >
          <Text style={styles.buttonText}>Print Barcode Demo</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  section: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  text: {
    marginTop: 5,
    fontSize: 16,
    color: '#666',
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  error: {
    marginTop: 10,
    fontSize: 16,
    color: 'red',
  },
  output: {
    maxHeight: 200,
    backgroundColor: '#f8f8f8',
    padding: 10,
    borderRadius: 6,
    marginTop: 5,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  key: {
    fontWeight: 'bold',
    marginRight: 6,
    flex: 1,
  },
  value: {
    flexShrink: 1,
    flex: 2,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10,
    flex: 1,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
    minHeight: 60,
    textAlignVertical: 'top',
    backgroundColor: 'white',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 10,
  },
  smallButton: {
    backgroundColor: '#007AFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
