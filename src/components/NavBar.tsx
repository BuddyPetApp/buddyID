import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { router, usePathname } from 'expo-router';
import { Logomark } from './Logo';
import { InfoIcon, UsersIcon, MailIcon } from './Icons';
import { colors, font, spacing } from '../tokens';

const NAV_ITEMS = [
  { label: 'BuddyID',    route: '/buddyid',            Icon: ({ color }: any) => <Logomark color={color} size={22} /> },
  { label: 'Sobre nós',  route: '/buddyid/sobre-nos',  Icon: ({ color }: any) => <InfoIcon size={22} color={color} strokeWidth={2} /> },
  { label: 'Marketplace', route: '/buddyid/parceiros',  Icon: ({ color }: any) => <UsersIcon size={22} color={color} strokeWidth={2} /> },
  { label: 'Contacto',   route: '/buddyid/contacto',   Icon: ({ color }: any) => <MailIcon size={22} color={color} strokeWidth={2} /> },
];

export function NavBar() {
  const pathname = usePathname();
  return (
    <View style={s.nav}>
      {NAV_ITEMS.map((item, i) => {
        const active = pathname === item.route || (i === 0 && pathname === '/buddyid');
        const color  = active ? '#fff' : 'rgba(255,255,255,0.45)';
        return (
          <TouchableOpacity key={item.label} style={s.item} onPress={() => router.push(item.route as any)}>
            <View style={[s.iconWrap, active && s.iconWrapActive]}>
              <item.Icon color={color} />
            </View>
            <Text style={[s.label, active && s.labelActive]}>{item.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  nav: {
    flexDirection: 'row',
    backgroundColor: colors.primaryDark,
    paddingBottom: spacing[1],
    paddingTop: spacing[2],
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  item:          { flex: 1, alignItems: 'center', paddingVertical: spacing[1], gap: 3 },
  iconWrap:      { width: 36, height: 28, alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
  iconWrapActive:{ backgroundColor: 'rgba(255,255,255,0.15)' },
  label:         { fontFamily: font.medium, fontSize: 10, color: 'rgba(255,255,255,0.5)' },
  labelActive:   { color: '#fff', fontFamily: font.semiBold },
});
