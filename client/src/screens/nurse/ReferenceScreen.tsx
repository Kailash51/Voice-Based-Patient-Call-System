import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Image, ScrollView, Modal } from 'react-native';
import { WebView } from 'react-native-webview';
import { ActivityIndicator } from 'react-native-paper';

// Book data structure with cover images and PDF URLs
const books = [
  {
    id: 1,
    title: 'Data Interpretation',
    coverImage: require('../../../assets/Data Interpretation.jpeg'),
    pdfUrl: 'https://www.dropbox.com/scl/fi/5ah856c7faxm9qkscfiyr/Data-interpretation-for-medical-students-2e-pastest.pdf?rlkey=0vnlbtq2tlu170r5dv6avn6d0&st=ke0sqe5h&dl=0 '
  },
  {
    id: 2,
    title: 'Internal Medicine',
    coverImage: require('../../../assets/Internal Medicine.jpeg'),
    pdfUrl: 'https://www.dropbox.com/scl/fi/e48i7h43saylfvdy730kx/harrison-s-principles-of-internal-medicine-21st-edition.pdf?rlkey=0nlyam00ilmgh2hs1czpuuydn&st=t6bnsfhy&dl=0 ' // Replace with actual URL
  },
  {
    id: 3,
    title: 'The Gale',
    coverImage: require('../../../assets/The Gale.jpeg'),
    pdfUrl: 'https://www.dropbox.com/scl/fi/jl4lyk0gehkb4y3wjd736/Medical_book.pdf?rlkey=o67phys6waii0cxw8llf9mslu&st=6jpd667w&dl=0' // Replace with actual URL
  },
  {
    id: 4,
    title: 'TextBook of Human Anatomy',
    coverImage: require('../../../assets/TextBook of Human Anatomy.jpeg'),
    pdfUrl: 'https://www.dropbox.com/scl/fi/lgv8f7c2pos14qoa01ca6/TextBook-of-Human-Anatomy.pdf?rlkey=91r7okh0vcogw3r06rdro5u16&st=eny4lyb3&dl=0 ' // Replace with actual URL
  },
  {
    id: 5,
    title: 'A-Z Family Medical',
    coverImage: require('../../../assets/a-z family medical.jpeg'),
    pdfUrl: 'https://www.dropbox.com/scl/fi/8x81vzpl7cfjxvi5bbhjf/a-z-family-medical-encyclopedia-pr.pdf?rlkey=tutmbutcke9fngdmvgw8rgc8h&st=62v18rbs&dl=0 ' // Replace with actual URL
  }
];

const PDFViewer = ({ url, onClose }: { url: string; onClose: () => void }) => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <WebView
          source={{ uri: url }}
          style={styles.webview}
          onLoadEnd={() => setIsLoading(false)}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          scalesPageToFit={true}
          allowsFullscreenVideo={true}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
        />
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        )}
      </View>
    </Modal>
  );
};

export const ReferenceScreen = () => {
  const [selectedBook, setSelectedBook] = useState<typeof books[0] | null>(null);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.gridContainer}>
          {books.map((book) => (
            <TouchableOpacity
              key={book.id}
              style={styles.bookContainer}
              onPress={() => setSelectedBook(book)}
            >
              <Image
                source={book.coverImage}
                style={styles.bookCover}
                resizeMode="contain"
              />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {selectedBook && (
        <PDFViewer
          url={selectedBook.pdfUrl}
          onClose={() => setSelectedBook(null)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    padding: 10,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
  },
  bookContainer: {
    width: Dimensions.get('window').width * 0.45,
    aspectRatio: 0.7,
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  bookCover: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  webview: {
    flex: 1,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
}); 