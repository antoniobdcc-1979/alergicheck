import React, { useState } from 'react';
import { SafeAreaView, ScrollView, View, Text, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { StatusBar } from 'expo-status-bar';
import { analyzeImage, AnalysisResult } from './src/services/analyzeImage';
import { JAIME_PROFILE } from './src/data/jaimeProfile';

type ScanMode = 'ingredients' | 'product' | 'dish' | 'restaurant';

const MODES: { key: ScanMode; title: string; subtitle: string }[] = [
  { key: 'ingredients', title: 'Ingredientes', subtitle: 'Etiqueta o ficha técnica' },
  { key: 'product', title: 'Producto', subtitle: 'Foto del envase' },
  { key: 'dish', title: 'Plato', subtitle: 'Receta o plato preparado' },
  { key: 'restaurant', title: 'Restaurante', subtitle: 'Carta, menú o plato' },
];

export default function App() {
  const [selectedMode, setSelectedMode] = useState<ScanMode>('ingredients');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<AnalysisResult[]>([]);

  const pickImage = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permiso necesario', 'Necesito acceso a la cámara para escanear alimentos.');
      return;
    }

    const photo = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.85,
      base64: true,
    });

    if (!photo.canceled && photo.assets[0]) {
      const asset = photo.assets[0];
      setImageUri(asset.uri);
      const analysis = await analyzeImage({
        mode: selectedMode,
        imageBase64: asset.base64 ?? '',
        profile: JAIME_PROFILE,
      });
      setResult(analysis);
      setHistory(prev => [analysis, ...prev].slice(0, 10));
    }
  };

  const resultStyle =
    result?.status === 'GREEN' ? styles.green :
    result?.status === 'AMBER' ? styles.amber :
    styles.red;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Perfil activo</Text>
          <Text style={styles.title}>Jaime Safe Food</Text>
          <Text style={styles.subtitle}>Decisiones rápidas, criterio conservador.</Text>
        </View>

        <View style={styles.profileCard}>
          <Text style={styles.cardTitle}>Riesgos bloqueantes</Text>
          <Text style={styles.profileText}>
            Avellana, almendra, pistacho, nuez, cacahuete, piñón, sésamo,
            semilla de girasol, lentejas y ajo. Trazas siempre bloqueadas.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>¿Qué quieres analizar?</Text>
        <View style={styles.modeGrid}>
          {MODES.map(mode => (
            <TouchableOpacity
              key={mode.key}
              style={[styles.modeCard, selectedMode === mode.key && styles.modeCardActive]}
              onPress={() => setSelectedMode(mode.key)}
            >
              <Text style={styles.modeTitle}>{mode.title}</Text>
              <Text style={styles.modeSubtitle}>{mode.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.scanButton} onPress={pickImage}>
          <Text style={styles.scanButtonText}>Escanear alimento</Text>
        </TouchableOpacity>

        {imageUri && <Image source={{ uri: imageUri }} style={styles.preview} />}

        {result && (
          <View style={[styles.resultCard, resultStyle]}>
            <Text style={styles.resultLabel}>
              {result.status === 'GREEN' ? '🟢 APTO' : result.status === 'AMBER' ? '🟠 DUDA' : '🔴 NO APTO'}
            </Text>
            <Text style={styles.resultTitle}>{result.title}</Text>
            <Text style={styles.resultExplanation}>{result.explanation}</Text>

            {result.detectedRisks.length > 0 && (
              <View style={styles.risksBox}>
                <Text style={styles.risksTitle}>Riesgos detectados</Text>
                {result.detectedRisks.map((risk, index) => (
                  <Text key={index} style={styles.riskItem}>• {risk}</Text>
                ))}
              </View>
            )}
          </View>
        )}

        <Text style={styles.sectionTitle}>Historial reciente</Text>
        {history.length === 0 ? (
          <Text style={styles.empty}>Todavía no hay análisis guardados.</Text>
        ) : history.map((item, index) => (
          <View key={index} style={styles.historyItem}>
            <Text style={styles.historyStatus}>
              {item.status === 'GREEN' ? '🟢' : item.status === 'AMBER' ? '🟠' : '🔴'} {item.title}
            </Text>
            <Text style={styles.historyText}>{item.explanation}</Text>
          </View>
        ))}

        <Text style={styles.disclaimer}>
          Esta app es una ayuda familiar. No sustituye consejo médico, pauta de alergología ni revisión final del etiquetado.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8F1E8' },
  container: { padding: 22, paddingBottom: 48 },
  header: { marginBottom: 18 },
  eyebrow: { color: '#8A6F55', fontSize: 13, fontWeight: '700', textTransform: 'uppercase' },
  title: { color: '#2E241B', fontSize: 34, fontWeight: '800', marginTop: 6 },
  subtitle: { color: '#6D5A48', fontSize: 17, marginTop: 8 },
  profileCard: { backgroundColor: '#FFF9F0', borderRadius: 26, padding: 20, marginBottom: 24, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 16 },
  cardTitle: { fontSize: 18, fontWeight: '800', color: '#2E241B', marginBottom: 8 },
  profileText: { fontSize: 15, lineHeight: 22, color: '#6D5A48' },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: '#2E241B', marginBottom: 12, marginTop: 8 },
  modeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  modeCard: { width: '47%', backgroundColor: '#FFF9F0', borderRadius: 22, padding: 16, borderWidth: 1, borderColor: '#F0DFCC' },
  modeCardActive: { borderColor: '#B87952', backgroundColor: '#FFEAD8' },
  modeTitle: { fontSize: 17, fontWeight: '800', color: '#2E241B' },
  modeSubtitle: { fontSize: 13, color: '#7B6654', marginTop: 4 },
  scanButton: { backgroundColor: '#2E241B', borderRadius: 24, padding: 18, alignItems: 'center', marginVertical: 22 },
  scanButtonText: { color: '#FFF9F0', fontSize: 18, fontWeight: '800' },
  preview: { width: '100%', height: 260, borderRadius: 24, marginBottom: 18 },
  resultCard: { borderRadius: 28, padding: 22, marginBottom: 24 },
  green: { backgroundColor: '#DCE9D6' },
  amber: { backgroundColor: '#F4D7A1' },
  red: { backgroundColor: '#E7A08B' },
  resultLabel: { fontSize: 24, fontWeight: '900', color: '#2E241B' },
  resultTitle: { fontSize: 22, fontWeight: '900', color: '#2E241B', marginTop: 8 },
  resultExplanation: { fontSize: 16, lineHeight: 24, color: '#3B2C22', marginTop: 8 },
  risksBox: { marginTop: 16, backgroundColor: 'rgba(255,255,255,0.45)', borderRadius: 18, padding: 14 },
  risksTitle: { fontSize: 16, fontWeight: '800', marginBottom: 6, color: '#2E241B' },
  riskItem: { fontSize: 15, color: '#3B2C22', marginTop: 3 },
  historyItem: { backgroundColor: '#FFF9F0', borderRadius: 18, padding: 14, marginBottom: 10 },
  historyStatus: { fontSize: 16, fontWeight: '800', color: '#2E241B' },
  historyText: { fontSize: 14, color: '#6D5A48', marginTop: 4 },
  empty: { color: '#7B6654', marginBottom: 12 },
  disclaimer: { color: '#8A6F55', fontSize: 12, lineHeight: 18, marginTop: 14 }
});
