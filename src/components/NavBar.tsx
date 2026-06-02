import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { router, usePathname } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { Logomark } from './Logo';
import { colors, font, spacing } from '../tokens';

const InfoIcon = ({ color }: { color: string }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
    <Path d="M12 16v-4" />
    <Path d="M12 8h.01" />
  </Svg>
);

const UsersIcon = ({ color }: { color: string }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <Path d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
    <Path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <Path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </Svg>
);

const MailIcon = ({ color }: { color: string }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <Path d="M22 6l-10 7L2 6" />
  </Svg>
);

const NAV_ITEMS = [
  { label: 'BuddyID', route: '/buddyid', Icon: ({ color }: any) => <Logomark color={color} size={22} /> },
  { label: 'Sobre nós', route: '/buddyid/sobre-nos', Icon: InfoIcon },
  { label: 'Parceiros', route: '/buddyid/parceiros', Icon: UsersIcon },
  { label: 'Contacto', route: '/buddyid/contacto', Icon: MailIcon },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <View style={s.nav}>
      {NAV_ITEMS.map((item, i) => {
        const active = pathname === item.route || (i === 0 && pathname === '/buddyid');
        const color = active ? '#fff' : 'rgba(255,255,255,0.5)';
        return (
          <TouchableOpacity key={item.label} style={s.navItem} onPress={() => router.push(item.route as any)}>
            <item.Icon color={color} />
            <Text style={[s.navLabel, active && s.navLabelActive]}>{item.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  nav: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    paddingBottom: spacing[2],
    paddingTop: spacing[2],
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  navItem: { flex: 1, alignItems: 'center', paddingVertical: spacing[2], gap: 4 },
  navLabel: { fontFamily: font.medium, fontSize: 11, color: 'rgba(255,255,255,0.6)' },
  navLabelActive: { color: '#fff', fontFamily: font.semiBold },
});
