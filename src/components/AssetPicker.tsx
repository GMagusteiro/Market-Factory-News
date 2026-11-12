import { useMemo, useState } from 'react';
import { Keyboard, Pressable, TextInput, View } from 'react-native';

import { useDataset } from '@/data';
import { layout, radius, space } from '@/design/tokens';
import { useTheme } from '@/design/useTheme';
import { searchAssets } from '@/lib/search';
import type { Asset } from '@/lib/types';

import { AppText } from './ui/AppText';
import { Badge } from './ui/Badge';

interface AssetPickerProps {
  onSelect: (asset: Asset) => void;
  placeholder?: string;
}

/** Caixa de pesquisa com lista de sugestões: procura por símbolo, nome ou alias. */
export function AssetPicker({
  onSelect,
  placeholder = 'Pesquisar ativo: NVIDIA, EUR/USD, Apple…',
}: AssetPickerProps) {
  const { colors } = useTheme();
  const dataset = useDataset();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const results = useMemo(() => searchAssets(query, 8, dataset.assets), [query, dataset.assets]);
  const showList = open && query.trim().length > 0;

  function select(asset: Asset) {
    setQuery('');
    setOpen(false);
    Keyboard.dismiss();
    onSelect(asset);
  }

  return (
    <View style={{ zIndex: 10 }}>
      <TextInput
        value={query}
        onChangeText={(text) => {
          setQuery(text);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        // Pequeno atraso para o toque numa sugestão não se perder quando o campo perde o foco.
        onBlur={() => setTimeout(() => setOpen(false), 200)}
        onSubmitEditing={() => {
          if (results[0]) select(results[0]);
        }}
        onKeyPress={(event) => {
          if (event.nativeEvent.key === 'Escape') setOpen(false);
        }}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        accessibilityLabel="Pesquisar ativo"
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        style={{
          height: layout.controlHeight,
          paddingHorizontal: space.lg,
          borderRadius: radius.md,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.surface,
          color: colors.text,
          fontSize: 16,
        }}
      />
      {showList ? (
        <View
          accessibilityRole="list"
          style={{
            position: 'absolute',
            top: layout.controlHeight + space.xs,
            left: 0,
            right: 0,
            zIndex: 20,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radius.md,
            paddingVertical: space.xs,
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.14)',
          }}>
          {results.length === 0 ? (
            <AppText tone="muted" style={{ padding: space.md }}>
              Sem resultados para “{query.trim()}”.
            </AppText>
          ) : (
            results.map((asset) => (
              <Pressable
                key={asset.slug}
                accessibilityRole="button"
                accessibilityLabel={`${asset.name} (${asset.symbol})`}
                onPress={() => select(asset)}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: space.md,
                  paddingHorizontal: space.lg,
                  paddingVertical: space.md,
                  backgroundColor: pressed ? colors.surfaceAlt : 'transparent',
                })}>
                <AppText variant="subheading" style={{ minWidth: 76 }}>
                  {asset.symbol}
                </AppText>
                <AppText tone="muted" style={{ flex: 1 }} numberOfLines={1}>
                  {asset.name}
                </AppText>
                <Badge label={asset.kind === 'forex' ? 'Forex' : 'Ação'} />
              </Pressable>
            ))
          )}
        </View>
      ) : null}
    </View>
  );
}
