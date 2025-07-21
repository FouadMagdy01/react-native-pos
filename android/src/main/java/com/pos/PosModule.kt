package com.pos

import android.graphics.BitmapFactory
import android.os.Bundle
import android.util.Base64
import android.util.Log
import androidx.compose.ui.graphics.Color
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Callback
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableMap
import com.facebook.react.module.annotations.ReactModule
import com.wisepos.smartpos.InitPosSdkListener
import com.wisepos.smartpos.WisePosSdk
import com.wisepos.smartpos.device.Device
import com.wisepos.smartpos.printer.Printer
import com.wisepos.smartpos.printer.PrinterListener
import com.wisepos.smartpos.printer.TextInfo

@ReactModule(name = PosModule.NAME)
class PosModule(reactContext: ReactApplicationContext) :
  NativePosSpec(reactContext) {
  private var printer: Printer? = null
  private var device: Device? = null


  override fun getName(): String {
    return NAME
  }


  override fun initPosSdk(onSuccess: Callback?, onFailure: Callback?) {
    val wisePosSdk = WisePosSdk.getInstance()
    wisePosSdk.initPosSdk(reactApplicationContext, object : InitPosSdkListener {
      override fun onInitPosSuccess() {
        Log.d(NAME, "initPosSdk: success")
        // Initialize printer and device instances
        printer = wisePosSdk.printer
        device = wisePosSdk.device
        onSuccess?.invoke()
      }

      override fun onInitPosFail(errorCode: Int) {
        Log.e(NAME, "initPosSdk: failed with error code $errorCode")
        onFailure?.invoke(errorCode)
      }
    })
  }

  override fun getPrinter(): WritableMap? {
    return try {
      val printerInstance = printer ?: throw Exception("Printer not initialized")
      val status = printerInstance.printerStatus
      val result = Arguments.createMap()

      for ((key, value) in status) {
        when (value) {
          is String -> result.putString(key, value)
          is Int -> result.putInt(key, value)
          is Double -> result.putDouble(key, value)
          is Boolean -> result.putBoolean(key, value)
          else -> result.putString(key, value.toString())
        }
      }
      Log.d(NAME, "Printer status: $status")
      result
    } catch (e: Exception) {
      Log.e(NAME, "Error accessing printer: ${e.message}", e)
      null
    }
  }

  override fun getPrinterMileage(): Double {
    return try {
      val printerInstance = printer ?: throw Exception("Printer not initialized")
      printerInstance.printerMileage.toDouble()
    } catch (e: Exception) {
      Log.e(NAME, "Error getting printer mileage: ${e.message}", e)
      0.0
    }
  }

  override fun clearPrinterMileage(callback: Callback) {
    try {
      val printerInstance = printer ?: throw Exception("Printer not initialized")
      printerInstance.clearPrinterMileage()
      callback.invoke(null) // Success
    } catch (e: Exception) {
      Log.e(NAME, "Error clearing printer mileage: ${e.message}", e)
      callback.invoke(e.message)
    }
  }

  override fun initPrinter(callback: Callback) {
    try {
      val printerInstance = printer ?: throw Exception("Printer not initialized")
      val result = printerInstance.initPrinter()
      if (result == 0) {
        callback.invoke(null) // Success
      } else {
        callback.invoke("Init printer failed with code: $result")
      }
    } catch (e: Exception) {
      Log.e(NAME, "Error initializing printer: ${e.message}", e)
      callback.invoke(e.message)
    }
  }

  override fun setGrayLevel(grayLevel: Double, callback: Callback) {
    try {
      val printerInstance = printer ?: throw Exception("Printer not initialized")
      val result = printerInstance.setGrayLevel(grayLevel.toInt())
      if (result == 0) {
        callback.invoke(null) // Success
      } else {
        callback.invoke("Set gray level failed with code: $result")
      }
    } catch (e: Exception) {
      Log.e(NAME, "Error setting gray level: ${e.message}", e)
      callback.invoke(e.message)
    }
  }

  override fun setPrintFont(fontConfig: ReadableMap, callback: Callback) {
    try {
      val printerInstance = printer ?: throw Exception("Printer not initialized")
      val bundle = Bundle()

      // Handle different font configuration options
      if (fontConfig.hasKey("font")) {
        bundle.putString("font", fontConfig.getString("font"))
      }
      if (fontConfig.hasKey("systemFont")) {
        bundle.putString("systemFont", fontConfig.getString("systemFont"))
      }
      if (fontConfig.hasKey("path")) {
        bundle.putString("path", fontConfig.getString("path"))
      }

      printerInstance.setPrintFont(bundle)
      callback.invoke(null) // Success
    } catch (e: Exception) {
      Log.e(NAME, "Error setting print font: ${e.message}", e)
      callback.invoke(e.message)
    }
  }

  override fun setLineSpacing(spacing: Double, callback: Callback) {
    try {
      val printerInstance = printer ?: throw Exception("Printer not initialized")
      printerInstance.setLineSpacing(spacing.toInt())
      callback.invoke(null) // Success
    } catch (e: Exception) {
      Log.e(NAME, "Error setting line spacing: ${e.message}", e)
      callback.invoke(e.message)
    }
  }

  override fun addSingleText(textConfig: ReadableMap, callback: Callback) {
    try {
      val printerInstance = printer ?: throw Exception("Printer not initialized")
      val textInfo = createTextInfo(textConfig)
      printerInstance.addSingleText(textInfo)
      callback.invoke(null) // Success
    } catch (e: Exception) {
      Log.e(NAME, "Error adding single text: ${e.message}", e)
      callback.invoke(e.message)
    }
  }

  override fun addMultiText(textConfigArray: ReadableArray, callback: Callback) {
    try {
      val printerInstance = printer ?: throw Exception("Printer not initialized")
      val textInfoList = mutableListOf<TextInfo>()

      for (i in 0 until textConfigArray.size()) {
        val textConfig = textConfigArray.getMap(i)
        if(textConfig != null) {
          textInfoList.add(createTextInfo(textConfig))
        }
      }

      printerInstance.addMultiText(textInfoList)
      callback.invoke(null) // Success
    } catch (e: Exception) {
      Log.e(NAME, "Error adding multi text: ${e.message}", e)
      callback.invoke(e.message)
    }
  }

  override fun addPicture(pictureConfig: ReadableMap, callback: Callback) {
    try {
      val printerInstance = printer ?: throw Exception("Printer not initialized")

      val align = pictureConfig.getInt("align")
      val base64Image = pictureConfig.getString("base64Image")
        ?: throw Exception("base64Image is required")

      // Decode base64 to bitmap
      val imageBytes = Base64.decode(base64Image, Base64.DEFAULT)
      val bitmap = BitmapFactory.decodeByteArray(imageBytes, 0, imageBytes.size)
        ?: throw Exception("Failed to decode image")

      printerInstance.addPicture(align, bitmap)
      callback.invoke(null) // Success
    } catch (e: Exception) {
      Log.e(NAME, "Error adding picture: ${e.message}", e)
      callback.invoke(e.message)
    }
  }

  override fun addBarCode(barcodeConfig: ReadableMap, callback: Callback) {
    try {
      val printerInstance = printer ?: throw Exception("Printer not initialized")

      val type = barcodeConfig.getInt("type")
      val width = barcodeConfig.getInt("width")
      val height = barcodeConfig.getInt("height")
      val data = barcodeConfig.getString("data") ?: throw Exception("data is required")

      printerInstance.addBarCode(type, width, height, data)
      callback.invoke(null) // Success
    } catch (e: Exception) {
      Log.e(NAME, "Error adding barcode: ${e.message}", e)
      callback.invoke(e.message)
    }
  }

  override fun addQrCode(qrConfig: ReadableMap, callback: Callback) {
    try {
      val printerInstance = printer ?: throw Exception("Printer not initialized")

      val width = qrConfig.getInt("width")
      val height = qrConfig.getInt("height")
      val data = qrConfig.getString("data") ?: throw Exception("data is required")

      printerInstance.addQrCode(width, height, data)
      callback.invoke(null) // Success
    } catch (e: Exception) {
      Log.e(NAME, "Error adding QR code: ${e.message}", e)
      callback.invoke(e.message)
    }
  }

  override fun feedPaper(dots: Double, callback: Callback) {
    try {
      val printerInstance = printer ?: throw Exception("Printer not initialized")
      printerInstance.feedPaper(dots.toInt())
      callback.invoke(null) // Success
    } catch (e: Exception) {
      Log.e(NAME, "Error feeding paper: ${e.message}", e)
      callback.invoke(e.message)
    }
  }


  override fun startPrinting(onSuccess: Callback , onFailure: Callback) {
    try {
      val printerInstance = printer ?: throw Exception("Printer not initialized")

      val bundle = Bundle()


      printerInstance.startPrinting(bundle, object : PrinterListener {
        override fun onError(errorCode: Int) {
          onFailure.invoke()
          Log.e(NAME, "Printing failed with error code: $errorCode")
        }

        override fun onFinish() {
          onSuccess.invoke()
          Log.d(NAME, "Printing finished successfully")
        }

        override fun onReport(event: Int) {
          // Reserved callback method, no functionality required
        }
      })

    } catch (e: Exception) {
      Log.e(NAME, "Error starting printing: ${e.message}", e)
    }
  }

  // Device methods
  override fun getVersionInfo(): WritableMap? {
    return try {
      val deviceInstance = device ?: throw Exception("Device not initialized")
      val versionInfo = deviceInstance.versionInfo
      val result = Arguments.createMap()

      for ((key, value) in versionInfo) {
        result.putString(key, value)
      }

      result
    } catch (e: Exception) {
      Log.e(NAME, "Error getting version info: ${e.message}", e)
      null
    }
  }

  override fun getDeviceSn(): String? {
    return try {
      val deviceInstance = device ?: throw Exception("Device not initialized")
      deviceInstance.deviceSn
    } catch (e: Exception) {
      Log.e(NAME, "Error getting device serial number: ${e.message}", e)
      null
    }
  }

  // Helper method to create TextInfo from ReadableMap
  private fun createTextInfo(textConfig: ReadableMap): TextInfo {
    val textInfo = TextInfo()

    // Required text field
    if (textConfig.hasKey("text")) {
      textInfo.text = textConfig.getString("text")
    }

    // Optional styling fields with defaults
    if (textConfig.hasKey("align")) {
      textInfo.align = textConfig.getInt("align")
    }

    if (textConfig.hasKey("fontSize")) {
      textInfo.fontSize = textConfig.getInt("fontSize")
    }

    if (textConfig.hasKey("width")) {
      textInfo.width = textConfig.getInt("width")
    } else {
      textInfo.width = -1 // Default value
    }

    if (textConfig.hasKey("columnSpacing")) {
      textInfo.columnSpacing = textConfig.getInt("columnSpacing")
    } else {
      textInfo.columnSpacing = -1 // Default value
    }

    if (textConfig.hasKey("isBold")) {
      textInfo.isBold = textConfig.getBoolean("isBold")
    }

    if (textConfig.hasKey("isItalic")) {
      textInfo.isItalic = textConfig.getBoolean("isItalic")
    }

    if (textConfig.hasKey("isWithUnderline")) {
      textInfo.isWithUnderline = textConfig.getBoolean("isWithUnderline")
    }

    if (textConfig.hasKey("isReverseText")) {
      textInfo.isReverseText = textConfig.getBoolean("isReverseText")
    }

    return textInfo
  }

  companion object {
    const val NAME = "Pos"
    // Alignment constants for JavaScript
    const val PRINT_ALIGN_STYLE_LEFT = 0x01
    const val PRINT_ALIGN_STYLE_CENTER = 0x02
    const val PRINT_ALIGN_STYLE_RIGHT = 0x04

    // Barcode type constants
    const val BARCODE_TYPE_BARCODE_128 = 0x01
    const val BARCODE_TYPE_PDF417 = 0x02
    const val BARCODE_TYPE_BARCODE_39 = 0x0A
  }
}
