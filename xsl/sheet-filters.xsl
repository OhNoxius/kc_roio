<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<xsl:output method="html" doctype-public="-//W3C//DTD XHTML 1.0 Strict//EN" doctype-system="http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd" encoding="UTF-8" />
	
	<xsl:param name="input" />
	<xsl:param name="id" />
	
	<xsl:variable name="smallcase" select="'abcdefghijklmnopqrstuvwxyzéèëêàçö'" />
	<xsl:variable name="uppercase" select="'ABCDEFGHIJKLMNOPQRSTUVWXYZEEEEACO'" />
	<xsl:variable name="mainsheet" select="name(/*[1]/*[1])" />
	
	<xsl:key name="key1" match="/*[1]/*[1]/*[1]/attribute::*[local-name(.) = local-name(/*[1]/*)]" use="string(.)"></xsl:key>
	
	<xsl:template match="/">
		<xsl:value-of select="/*[1]/*[1]/*[1]/attribute::*[local-name(current()) = local-name(/*[1]/*)][generate-id() = generate-id(key('key1', string(current()))[1])]"/>
		<xsl:apply-templates select="*[1]/*" mode="sheets" />
		<a href="#" id="search" class="btn">search</a>
	</xsl:template>
	
	
	<!-- INPUT FIELDS -->	
	<xsl:template match="*" mode="sheets">
		
		<!-- TEST for every attribute (in the first child of the mainsheet) if there is a corresponding sheetname -->
		<xsl:if test="/*[1]/*[1]/*[1]/attribute::*[local-name(current()) = local-name(.)]">
			<label for="{local-name(.)}">
				<xsl:value-of select="local-name(.)" />
			</label>
			<input list="{local-name(.)}-list" id="{local-name(.)}" name="{local-name(.)}" class="searchfield" />
			<datalist id="{local-name(.)}-list">
				<!--<xsl:apply-templates select="*" mode="datalist" />-->
			</datalist>
		</xsl:if>
		
	</xsl:template>
	
	<!--<xsl:template match="*[1]/*[1]/attribute::*" mode="keys2">
		<xsl:if test="/*[1]/*[local-name(.) = local-name(current())]">
			<p>
				<label for="{local-name(.)}">
					<xsl:value-of select="local-name(.)" />
				</label>
				<input list="{local-name(.)}-list" id="{local-name(.)}" name="{local-name(.)}" />
				<datalist id="{local-name(.)}-list">
					<xsl:apply-templates select="*" mode="datalist" />
				</datalist>
			</p>
		</xsl:if>
	</xsl:template>-->
	<xsl:template match="*" mode="datalist">
		<option value="{attribute::*[1]}" />
	</xsl:template>
	<!--<xsl:template match="/*[1]/*" mode="keymatch">
		<xsl:value-of select="." />
	</xsl:template>-->
	
</xsl:stylesheet>
	