import GoBackIconButton from '@/components/GoBackIconButton';
import { useAuthStore } from '@/presentation/auth/store/useAuthStore';
import { useTransferenciaStore } from '@/presentation/transferencias/store/useTransferenciasStore';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

const TarjetaDebitoPremium = () => {
  const { user, token } = useAuthStore();
  const { tarjetas, loading, error, obtenerTarjetas } = useTransferenciaStore();

  useEffect(() => {
    if (token) {
      obtenerTarjetas(token);
    }
  }, [token]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <GoBackIconButton />
        <ActivityIndicator size="large" color="#ec4899" />
        <Text style={styles.loadingText}>Cargando información kawaii... ✨</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <GoBackIconButton />
        <Text style={styles.errorTitle}>Error: {error}</Text>
        <Text style={styles.errorMessage}>
          No se pudo cargar la información de tu tarjeta kawaii 🥺
        </Text>
      </View>
    );
  }

  if (!tarjetas || tarjetas.length === 0) {
    return (
      <View style={styles.noCardsContainer}>
        <GoBackIconButton />
        <Text style={styles.emoji}>💳🌸</Text>
        <Text style={styles.noCardsTitle}>No tienes tarjetas kawaii</Text>
        <Text style={styles.noCardsMessage}>
          Contacta con el banco para solicitar tu tarjeta débito ✨
        </Text>
      </View>
    );
  }

  const tarjeta = tarjetas[0];

  return (
    <View style={styles.container}>
      <GoBackIconButton />
      
      <View style={styles.content}>
        {/* Tarjeta principal kawaii */}
        <View style={styles.card}>
          {/* Efectos kawaii */}
          <View style={styles.effectTop} />
          <View style={styles.effectBottom} />
          
          {/* Decoraciones kawaii */}
          <Text style={styles.deco1}>🌸</Text>
          <Text style={styles.deco2}>✨</Text>
          <Text style={styles.deco3}>⭐</Text>

          {/* Chip kawaii */}
          <View style={styles.chip}>
            <View style={styles.chipInner}>
              <View style={styles.chipLeft}>
                <View style={styles.chipLine} />
                <View style={styles.chipLine} />
              </View>
              <View style={styles.chipRight}>
                <View style={styles.chipLine} />
                <View style={styles.chipLine} />
              </View>
            </View>
          </View>

          {/* Logo MasterCard kawaii */}
          <View style={styles.logoContainer}>
            <View style={styles.logoRed} />
            <View style={styles.logoYellow} />
          </View>

          {/* Contenido */}
          <View style={styles.cardContent}>
            {/* Header */}
            <View style={styles.cardHeader}>
              <Text style={styles.mastercardText}>MASTERCARD</Text>
              <Text style={styles.debitoBadge}>DÉBITO</Text>
            </View>

            {/* Número de tarjeta formateado */}
            <Text style={styles.cardNumber}>
              {tarjeta.numero_tarjeta ? 
                tarjeta.numero_tarjeta.replace(/(\d{4})/g, '$1 ').trim() : 
                '**** **** **** ****'
              }
            </Text>

            {/* Información del titular, CVV y vencimiento */}
            <View style={styles.cardFooter}>
              <View style={styles.infoContainer}>
                <Text style={styles.label}>TITULAR</Text>
                <Text style={styles.holderName}>
                  {tarjeta.nombre_titular?.toUpperCase() || 'TITULAR'}
                </Text>
              </View>

              <View style={styles.infoContainer}>
                <Text style={styles.label}>CVV</Text>
                <Text style={styles.cvvValue}>
                  {tarjeta.cvv || '***'}
                </Text>
              </View>
              
              <View style={styles.infoContainer}>
                <Text style={styles.label}>VENCE</Text>
                <Text style={styles.expiryDate}>
                  {tarjeta.fecha_vencimiento ? 
                    `${tarjeta.fecha_vencimiento.split('/')[0]}/${tarjeta.fecha_vencimiento.split('/')[1]?.slice(-2)}` : 
                    'MM/AA'
                  }
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Nota de seguridad kawaii */}
        <View style={styles.securityNote}>
          <Text style={styles.shield}>🛡️</Text>
          <Text style={styles.securityText}>
            Mantén tu CVV en secreto. No lo compartas con nadie 🌸
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    marginTop: 60, // Espacio para el botón de regreso
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  loadingText: {
    color: '#374151',
    fontSize: 18,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorTitle: {
    color: '#ef4444',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 16,
  },
  errorMessage: {
    color: '#374151',
    textAlign: 'center',
    marginBottom: 16,
  },
  noCardsContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  noCardsTitle: {
    color: '#374151',
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  noCardsMessage: {
    color: '#6b7280',
    textAlign: 'center',
    fontSize: 16,
  },
  card: {
    width: 384,
    height: 288,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 4,
    borderColor: '#fbcfe8',
  },
  effectTop: {
    position: 'absolute',
    top: -64,
    left: -64,
    width: 160,
    height: 160,
    backgroundColor: '#fce7f3',
    borderRadius: 80,
  },
  effectBottom: {
    position: 'absolute',
    bottom: -80,
    right: -80,
    width: 160,
    height: 160,
    backgroundColor: '#f3e8ff',
    borderRadius: 80,
  },
  deco1: {
    position: 'absolute',
    top: 16,
    right: 24,
    fontSize: 24,
    color: '#f472b6',
  },
  deco2: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    fontSize: 20,
    color: '#c084fc',
  },
  deco3: {
    position: 'absolute',
    top: 48,
    right: 64,
    fontSize: 18,
    color: '#fbbf24',
  },
  chip: {
    position: 'absolute',
    top: 24,
    left: 24,
    width: 48,
    height: 40,
    backgroundColor: '#fbbf24',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#f59e0b',
  },
  chipInner: {
    width: 40,
    height: 24,
    backgroundColor: '#fde68a',
    borderRadius: 8,
    flexDirection: 'row',
  },
  chipLeft: {
    flex: 1,
    borderRightWidth: 2,
    borderRightColor: '#f59e0b',
    padding: 2,
  },
  chipRight: {
    flex: 1,
    padding: 2,
  },
  chipLine: {
    height: 2,
    backgroundColor: '#d97706',
    borderRadius: 1,
    marginVertical: 1,
  },
  logoContainer: {
    position: 'absolute',
    top: 24,
    right: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoRed: {
    width: 32,
    height: 32,
    backgroundColor: '#f87171',
    borderRadius: 16,
    marginRight: -8,
    zIndex: 10,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  logoYellow: {
    width: 32,
    height: 32,
    backgroundColor: '#fbbf24',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  mastercardText: {
    color: '#1f2937',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  debitoBadge: {
    color: '#374151',
    fontSize: 12,
    fontWeight: 'bold',
    backgroundColor: '#fbcfe8',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  cardNumber: {
    color: '#1f2937',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 2,
    textAlign: 'center',
    marginTop: 20,
    fontFamily: 'monospace',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 16,
  },
  infoContainer: {
    alignItems: 'center',
    flex: 1,
  },
  label: {
    color: '#6b7280',
    fontSize: 12,
    marginBottom: 4,
  },
  holderName: {
    color: '#1f2937',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  cvvValue: {
    color: '#1f2937',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  expiryDate: {
    color: '#1f2937',
    fontSize: 14,
    fontWeight: '600',
  },
  securityNote: {
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    padding: 16,
    marginTop: 32,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fbcfe8',
    width: '100%',
  },
  shield: {
    fontSize: 20,
    marginRight: 8,
    color: '#f472b6',
  },
  securityText: {
    color: '#374151',
    fontSize: 14,
    textAlign: 'center',
    flex: 1,
  },
});

export default TarjetaDebitoPremium;