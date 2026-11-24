export interface OpenSourceLicenseItem {
  id: string;
  name: string;
  subtitle: string;
  license: string;
  copyright: string;
  licenseText: string;
  url?: string;
}

export const APP_INFO = {
  name: 'FindMyFamily',
  authorName: 'Cristian Castro',
  authorHandle: 'kencrisgdev',
  email: 'kencrisgdev@gmail.com',
  githubProfileUrl: 'https://github.com/kencrisg',
  mobileRepoUrl: 'https://github.com/kencrisg/FindMyFamily.Mobile',
  backendRepoUrl: 'https://github.com/kencrisg/FindMyFamily.backend',
} as const;

const mitLicenseText = (copyright: string): string =>
  `The MIT License (MIT)

Copyright (c) ${copyright}

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.`;

const iscLicenseText = (copyright: string): string =>
  `ISC License

Copyright (c) ${copyright}

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.`;

const bsd2ClauseLicenseText = (copyright: string): string =>
  `BSD 2-Clause License

Copyright (c) ${copyright}
All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.`;

export const APP_LICENSE_ENTRY: OpenSourceLicenseItem = {
  id: 'findmyfamily',
  name: 'FindMyFamily',
  subtitle: 'Aplicación móvil y plataforma familiar',
  license: 'MIT',
  copyright: '2026 Cristian Castro (kencrisgdev)',
  licenseText: mitLicenseText('2026 Cristian Castro (kencrisgdev)'),
  url: APP_INFO.mobileRepoUrl,
};

export const OPEN_SOURCE_LICENSES: ReadonlyArray<OpenSourceLicenseItem> = [
  {
    id: 'expo',
    name: 'Expo SDK & módulos Expo',
    subtitle: 'expo, expo-router, expo-location, expo-notifications · v57.x',
    license: 'MIT',
    copyright: '2015-present 650 Industries, Inc. (aka Expo)',
    licenseText: mitLicenseText('2015-present 650 Industries, Inc. (aka Expo)'),
    url: 'https://github.com/expo/expo',
  },
  {
    id: 'react',
    name: 'React',
    subtitle: 'react · v19.2.3',
    license: 'MIT',
    copyright: 'Meta Platforms, Inc. and affiliates',
    licenseText: mitLicenseText('Meta Platforms, Inc. and affiliates'),
    url: 'https://github.com/facebook/react',
  },
  {
    id: 'react-native',
    name: 'React Native',
    subtitle: 'react-native · v0.86.3',
    license: 'MIT',
    copyright: 'Meta Platforms, Inc. and affiliates',
    licenseText: mitLicenseText('Meta Platforms, Inc. and affiliates'),
    url: 'https://github.com/facebook/react-native',
  },
  {
    id: 'zustand',
    name: 'Zustand',
    subtitle: 'zustand · v5.0.15',
    license: 'MIT',
    copyright: '2019 Paul Henschel',
    licenseText: mitLicenseText('2019 Paul Henschel'),
    url: 'https://github.com/pmndrs/zustand',
  },
  {
    id: 'axios',
    name: 'Axios',
    subtitle: 'axios · v1.20.0',
    license: 'MIT',
    copyright: '2014-present Matt Zabriskie & Collaborators',
    licenseText: mitLicenseText('2014-present Matt Zabriskie & Collaborators'),
    url: 'https://github.com/axios/axios',
  },
  {
    id: 'signalr',
    name: 'Microsoft SignalR Client',
    subtitle: '@microsoft/signalr · v10.0.11',
    license: 'MIT',
    copyright: '.NET Foundation and Contributors',
    licenseText: mitLicenseText('.NET Foundation and Contributors'),
    url: 'https://github.com/dotnet/aspnetcore',
  },
  {
    id: 'bottom-sheet',
    name: 'Gorhom Bottom Sheet',
    subtitle: '@gorhom/bottom-sheet · v5.2.14',
    license: 'MIT',
    copyright: '2020 Mo Gorhom',
    licenseText: mitLicenseText('2020 Mo Gorhom'),
    url: 'https://github.com/gorhom/react-native-bottom-sheet',
  },
  {
    id: 'reanimated',
    name: 'React Native Reanimated',
    subtitle: 'react-native-reanimated · v4.5.1',
    license: 'MIT',
    copyright: '2016 Software Mansion',
    licenseText: mitLicenseText('2016 Software Mansion'),
    url: 'https://github.com/software-mansion/react-native-reanimated',
  },
  {
    id: 'gesture-handler',
    name: 'React Native Gesture Handler',
    subtitle: 'react-native-gesture-handler · v2.32.0',
    license: 'MIT',
    copyright: '2016 Software Mansion',
    licenseText: mitLicenseText('2016 Software Mansion'),
    url: 'https://github.com/software-mansion/react-native-gesture-handler',
  },
  {
    id: 'screens',
    name: 'React Native Screens',
    subtitle: 'react-native-screens · v4.26.2',
    license: 'MIT',
    copyright: '2018 Software Mansion',
    licenseText: mitLicenseText('2018 Software Mansion'),
    url: 'https://github.com/software-mansion/react-native-screens',
  },
  {
    id: 'safe-area-context',
    name: 'React Native Safe Area Context',
    subtitle: 'react-native-safe-area-context · v5.7.0',
    license: 'MIT',
    copyright: '2019 Th3rd Wave',
    licenseText: mitLicenseText('2019 Th3rd Wave'),
    url: 'https://github.com/th3rdwave/react-native-safe-area-context',
  },
  {
    id: 'webview',
    name: 'React Native WebView',
    subtitle: 'react-native-webview · v13.16.1',
    license: 'MIT',
    copyright: '2015-present Facebook, Inc. / React Native Community',
    licenseText: mitLicenseText('2015-present Facebook, Inc. / React Native Community'),
    url: 'https://github.com/react-native-webview/react-native-webview',
  },
  {
    id: 'lucide',
    name: 'Lucide React Native',
    subtitle: 'lucide-react-native · v1.51.0',
    license: 'ISC',
    copyright: 'for portions of Lucide are held by Cole Bemis 2013-2022 as part of Feather (MIT). All other copyright (c) 2022 Lucide Contributors',
    licenseText: iscLicenseText('2022 Lucide Contributors'),
    url: 'https://github.com/lucide-icons/lucide',
  },
  {
    id: 'leaflet',
    name: 'Leaflet',
    subtitle: 'leaflet · v1.9.4',
    license: 'BSD-2-Clause',
    copyright: '2010-2023 Volodymyr Agafonkin, 2010-2011 CloudMade',
    licenseText: bsd2ClauseLicenseText('2010-2023 Volodymyr Agafonkin, 2010-2011 CloudMade'),
    url: 'https://github.com/Leaflet/Leaflet',
  },
  {
    id: 'openstreetmap',
    name: 'OpenStreetMap & Nominatim',
    subtitle: 'Teselas del mapa y geocodificación inversa',
    license: 'ODbL 1.0',
    copyright: 'OpenStreetMap Contributors',
    licenseText:
      'Los datos cartográficos y teselas mostradas en el mapa provienen de OpenStreetMap y están disponibles bajo la Open Database License (ODbL 1.0), con estilos bajo CC BY-SA 2.0.\n\nPara consultar los términos completos y la atribución oficial visita openstreetmap.org/copyright.',
    url: 'https://www.openstreetmap.org/copyright',
  },
];
